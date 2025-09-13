import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Draft } from './entities/draft.entity';
import { SubmissionStatus } from './entities/submission-status.enum';
import { DraftStatus } from './entities/draft.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';

export interface WorkResult {
  kind: 'submission' | 'draft' | 'empty';
  submission?: Submission;
  draft?: Draft;
}

@Injectable()
export class CeoApprovalService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    @InjectRepository(Draft)
    private draftsRepository: Repository<Draft>,
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
    private dataSource: DataSource,
  ) {}

  /**
   * Work resolver - determines what entity the frontend should work with
   */
  async getWork(organizationId: string, periodId: string): Promise<WorkResult> {
    // First check if there's a submission (OPEN or LOCKED)
    const submission = await this.submissionsRepository.findOne({
      where: {
        organizationId,
        periodId,
        status: In([SubmissionStatus.OPEN, SubmissionStatus.LOCKED])
      }
    });

    if (submission) {
      return { kind: 'submission', submission };
    }

    // Then check if there's an active draft
    const draft = await this.draftsRepository.findOne({
      where: {
        organizationId,
        periodId,
        status: DraftStatus.DRAFT
      }
    });

    if (draft) {
      return { kind: 'draft', draft };
    }

    return { kind: 'empty' };
  }

  /**
   * Submit draft for CEO approval
   */
  async submitForApproval(organizationId: string, userId: string, periodId: string): Promise<Submission> {
    return this.dataSource.transaction(async (manager) => {
      // Check if submission already exists (idempotent)
      const existingSubmission = await manager.findOne(Submission, {
        where: {
          organizationId,
          periodId,
          status: In([SubmissionStatus.OPEN, SubmissionStatus.LOCKED])
        }
      });

      if (existingSubmission) {
        return existingSubmission;
      }

      // Find active draft
      const draft = await manager.findOne(Draft, {
        where: {
          organizationId,
          periodId,
          status: DraftStatus.DRAFT
        }
      });

      if (!draft) {
        throw new NotFoundException('NO_ACTIVE_DRAFT');
      }

      // Create submission from draft
      const submission = await this.snapshotDraftToSubmission(manager, draft);

      // Archive draft and link to submission
      await manager.update(Draft, draft.id, {
        status: DraftStatus.ARCHIVED,
        submittedAsSubmissionId: submission.id
      });

      return submission;
    });
  }

  /**
   * CEO approve submission (OPEN → LOCKED)
   */
  async approveSubmission(organizationId: string, ceoId: string, periodId: string): Promise<Submission> {
    return this.dataSource.transaction(async (manager) => {
      const submission = await manager.findOne(Submission, {
        where: {
          organizationId,
          periodId,
          status: In([SubmissionStatus.OPEN, SubmissionStatus.LOCKED])
        }
      });

      if (!submission) {
        throw new NotFoundException('NO_SUBMISSION');
      }

      // If already locked, return current (idempotent)
      if (submission.status === SubmissionStatus.LOCKED) {
        return submission;
      }

      // Update to locked status
      return manager.save(Submission, {
        ...submission,
        status: SubmissionStatus.LOCKED,
        approvedAt: new Date(),
        approvedBy: ceoId
      });
    });
  }

  /**
   * CEO reopen submission (restore original draft)
   */
  async reopenSubmission(organizationId: string, ceoId: string, periodId: string): Promise<Draft> {
    return this.dataSource.transaction(async (manager) => {
      const submission = await manager.findOne(Submission, {
        where: {
          organizationId,
          periodId,
          status: In([SubmissionStatus.OPEN, SubmissionStatus.LOCKED])
        }
      });

      if (!submission) {
        throw new NotFoundException('NO_SUBMISSION');
      }

      // Find original draft
      let draft = await manager.findOne(Draft, {
        where: {
          organizationId,
          periodId,
          submittedAsSubmissionId: submission.id
        }
      });

      // If no original draft found, create new one seeded from submission
      if (!draft) {
        draft = await manager.save(Draft, {
          organizationId,
          periodId,
          status: DraftStatus.DRAFT,
          responses: submission.responses,
          submittedBy: submission.submittedBy,
          totalQuestions: submission.totalQuestions,
          completed: submission.completed,
          version: 1
        });
      } else {
        // Restore draft to active status
        await manager.update(Draft, draft.id, {
          status: DraftStatus.DRAFT,
          reopenedAt: new Date(),
          reopenedBy: ceoId
        });
      }

      // Copy files from submission back to draft
      await this.copySubmissionToDraft(manager, submission.id, draft.id);

      // Archive submission
      await manager.update(Submission, submission.id, {
        status: SubmissionStatus.ARCHIVED,
        reopenedAt: new Date(),
        reopenedBy: ceoId
      });

      return draft;
    });
  }

  /**
   * Edit submission (only while OPEN)
   */
  async editSubmission(organizationId: string, periodId: string, updates: Partial<Submission>): Promise<Submission> {
    const submission = await this.submissionsRepository.findOne({
      where: {
        organizationId,
        periodId,
        status: SubmissionStatus.OPEN
      }
    });

    if (!submission) {
      throw new NotFoundException('NO_SUBMISSION');
    }

    if (submission.status === SubmissionStatus.LOCKED) {
      throw new ForbiddenException('SUBMISSION_LOCKED');
    }

    return this.submissionsRepository.save({
      ...submission,
      ...updates
    });
  }

  /**
   * Start fresh draft (pre-submit only)
   */
  async startFresh(organizationId: string, userId: string, periodId: string): Promise<Draft> {
    return this.dataSource.transaction(async (manager) => {
      // Check if submission exists
      const existingSubmission = await manager.findOne(Submission, {
        where: {
          organizationId,
          periodId,
          status: In([SubmissionStatus.OPEN, SubmissionStatus.LOCKED])
        }
      });

      if (existingSubmission) {
        throw new ConflictException('SUBMISSION_EXISTS');
      }

      // Archive any existing active draft
      await manager.update(Draft, {
        organizationId,
        periodId,
        status: DraftStatus.DRAFT
      }, {
        status: DraftStatus.ARCHIVED
      });

      // Create new draft
      return manager.save(Draft, {
        organizationId,
        periodId,
        status: DraftStatus.DRAFT,
        submittedBy: userId,
        responses: {},
        completed: false,
        version: 1
      });
    });
  }

  /**
   * Snapshot draft to submission (create immutable copy)
   */
  private async snapshotDraftToSubmission(manager: any, draft: Draft): Promise<Submission> {
    const submission = await manager.save(Submission, {
      organizationId: draft.organizationId,
      periodId: draft.periodId,
      responses: draft.responses,
      submittedBy: draft.submittedBy,
      totalQuestions: draft.totalQuestions,
      completed: draft.completed,
      status: SubmissionStatus.OPEN,
      version: 1
    });

    // Snapshot files from draft to submission
    const draftFiles = await manager.find(FileUpload, {
      where: {
        organizationId: draft.organizationId,
        periodId: draft.periodId,
        isSnapshot: false
      }
    });

    for (const file of draftFiles) {
      await manager.save(FileUpload, {
        ...file,
        id: undefined, // Generate new ID
        submissionId: submission.id,
        isSnapshot: true,
        originalUploadId: file.id,
        snapshotCreatedAt: new Date(),
        status: 'completed'
      });
    }

    return submission;
  }

  /**
   * Copy submission files back to draft (for reopen)
   */
  private async copySubmissionToDraft(manager: any, submissionId: string, draftId: string): Promise<void> {
    // Find submission files
    const submissionFiles = await manager.find(FileUpload, {
      where: {
        submissionId,
        isSnapshot: true
      }
    });

    // Copy files back to draft (create new non-snapshot versions)
    for (const file of submissionFiles) {
      // Check if file already exists for this draft (idempotency)
      const existingFile = await manager.findOne(FileUpload, {
        where: {
          organizationId: file.organizationId,
          periodId: file.periodId,
          categoryId: file.categoryId,
          uploadType: file.uploadType,
          isSnapshot: false,
          originalUploadId: file.originalUploadId || file.id
        }
      });

      if (!existingFile) {
        await manager.save(FileUpload, {
          ...file,
          id: undefined, // Generate new ID
          submissionId: null,
          isSnapshot: false,
          originalUploadId: file.originalUploadId || file.id,
          snapshotCreatedAt: null,
          status: 'completed'
        });
      }
    }
  }
}
