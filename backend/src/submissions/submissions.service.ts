import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { SubmissionStatus } from './entities/submission-status.enum';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { PerformanceService } from '../performance/performance.service';

export interface CreateSubmissionDto {
  periodId: string;
  responses: Record<string, any>;
  submittedBy?: string;
  organizationId?: string;
  isDraft?: boolean; // If true, creates as draft; if false, submits immediately
}

export interface UpdateSubmissionDto {
  responses?: Record<string, any>;
  completed?: boolean;
  submittedBy?: string;
}

export interface SubmitSubmissionDto {
  submissionId: string;
  submittedBy?: string;
}

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
    private dataSource: DataSource,
    private performanceService: PerformanceService,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const { organizationId, periodId, isDraft = true } = createSubmissionDto;
      
      // Get the next version number for this organization/period
      const latestSubmission = await queryRunner.manager.findOne(Submission, {
        where: { organizationId, periodId },
        order: { version: 'DESC' }
      });
      
      const nextVersion = latestSubmission ? latestSubmission.version + 1 : 1;
      
      // Mark previous submissions as not latest
      if (latestSubmission) {
        await queryRunner.manager.update(Submission, 
          { organizationId, periodId },
          { isLatest: false }
        );
      }
      
      // Create new submission
      const submission = queryRunner.manager.create(Submission, {
        ...createSubmissionDto,
        version: nextVersion,
        parentSubmissionId: latestSubmission?.id,
        isLatest: true,
        status: isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED,
        completed: !isDraft,
        submittedAt: isDraft ? undefined : new Date(),
      });
      
      const savedSubmission = await queryRunner.manager.save(Submission, submission);
      
      // If submitting immediately, create file snapshots
      if (!isDraft) {
        await this.createFileSnapshots(queryRunner, savedSubmission.id, organizationId, periodId);
      }
      
      await queryRunner.commitTransaction();
      console.log(`✅ ${isDraft ? 'Draft' : 'Submission'} created: ${savedSubmission.id} (v${nextVersion})`);
      
      return savedSubmission;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`❌ Error creating submission:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async submitDraft(submitDto: SubmitSubmissionDto): Promise<Submission> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const { submissionId, submittedBy } = submitDto;
      
      // Get the draft submission
      const draftSubmission = await queryRunner.manager.findOne(Submission, {
        where: { id: submissionId, status: SubmissionStatus.DRAFT }
      });
      
      if (!draftSubmission) {
        throw new Error(`Draft submission with ID ${submissionId} not found`);
      }
      
      // Update submission to submitted status
      await queryRunner.manager.update(Submission, submissionId, {
        status: SubmissionStatus.SUBMITTED,
        completed: true,
        submittedAt: new Date(),
        submittedBy,
      });
      
      // Create file snapshots
      await this.createFileSnapshots(
        queryRunner, 
        submissionId, 
        draftSubmission.organizationId, 
        draftSubmission.periodId
      );
      
      // Create new draft for next version
      const newDraft = await this.create({
        periodId: draftSubmission.periodId,
        responses: draftSubmission.responses,
        submittedBy: draftSubmission.submittedBy,
        organizationId: draftSubmission.organizationId,
        isDraft: true,
      });
      
      await queryRunner.commitTransaction();
      console.log(`✅ Draft submitted: ${submissionId}, new draft created: ${newDraft.id}`);
      
      return await this.findOne(submissionId);
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`❌ Error submitting draft:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createFileSnapshots(
    queryRunner: any, 
    submissionId: string, 
    organizationId: string, 
    periodId: string
  ): Promise<void> {
    // Get all current draft files for this organization/period
    const draftFiles = await queryRunner.manager.find(FileUpload, {
      where: {
        organizationId,
        periodId,
        isSnapshot: false,
        submissionId: null, // Files not yet linked to a submission
      }
    });
    
    // Create snapshots of each file
    for (const file of draftFiles) {
      const snapshot = queryRunner.manager.create(FileUpload, {
        ...file,
        id: undefined, // Generate new ID
        submissionId,
        isSnapshot: true,
        originalUploadId: file.id,
        snapshotCreatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await queryRunner.manager.save(FileUpload, snapshot);
    }
    
    console.log(`📸 Created ${draftFiles.length} file snapshots for submission ${submissionId}`);
  }

  async findAll(): Promise<Submission[]> {
    return this.submissionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Submission> {
    return this.submissionsRepository.findOne({ where: { id } });
  }

  async findByPeriodId(periodId: string): Promise<Submission[]> {
    return this.submissionsRepository.find({
      where: { periodId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestSubmission(organizationId: string, periodId: string): Promise<Submission | null> {
    return this.submissionsRepository.findOne({
      where: { organizationId, periodId, isLatest: true },
      order: { version: 'DESC' }
    });
  }

  async findSubmissionHistory(organizationId: string, periodId: string): Promise<Submission[]> {
    return this.submissionsRepository.find({
      where: { organizationId, periodId },
      order: { version: 'DESC' }
    });
  }

  async findDraftSubmission(organizationId: string, periodId: string): Promise<Submission | null> {
    return this.submissionsRepository.findOne({
      where: { 
        organizationId, 
        periodId, 
        status: SubmissionStatus.DRAFT,
        isLatest: true 
      }
    });
  }

  async getSubmissionStats() {
    const total = await this.submissionsRepository.count();
    const completed = await this.submissionsRepository.count({
      where: { completed: true },
    });
    
    return {
      total,
      completed,
      pending: total - completed,
    };
  }

  async getDashboardStats(organizationId: string) {
    try {
      console.log(`🔍 Fetching dashboard stats for organization: ${organizationId}`);
      
      // Get organization-specific submissions
      const submissions = await this.submissionsRepository.find({
        where: { organizationId },
        order: { createdAt: 'DESC' },
      });
      
      console.log(`📊 Found ${submissions.length} submissions for organization`);

      // Get organization-specific performance calculations
      const performanceCalculations = await this.performanceService.findByOrganization(organizationId);
      console.log(`📈 Found ${performanceCalculations.length} performance calculations for organization`);

      // Calculate dashboard metrics
      const totalSubmissions = submissions.length;
      const completedSubmissions = submissions.filter(s => s.completed).length;
      
      // Active periods (unique period IDs)
      const activePeriods = new Set(submissions.map(s => s.periodId)).size;
      
      // Overdue responses (submissions older than 30 days that aren't completed)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const overdueResponses = submissions.filter(s => 
        !s.completed && new Date(s.createdAt) < thirtyDaysAgo
      ).length;
      
      // Pending reviews (completed submissions from last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const pendingReviews = submissions.filter(s => 
        s.completed && new Date(s.createdAt) >= sevenDaysAgo
      ).length;
      
      // Compliance score (average of latest performance calculations)
      let complianceScore = 0;
      if (performanceCalculations.length > 0) {
        const latestCalculations = performanceCalculations.slice(0, 3); // Last 3 calculations
        const totalScore = latestCalculations.reduce((sum, calc) => {
          const score = typeof calc.percentageScore === 'string' 
            ? parseFloat(calc.percentageScore) 
            : (calc.percentageScore || 0);
          return sum + score;
        }, 0);
        complianceScore = Math.round(totalScore / latestCalculations.length);
      }

      const result = {
        activePeriods,
        overdueResponses,
        pendingReviews,
        complianceScore,
        totalSubmissions,
        completedSubmissions,
        organizationId,
        lastUpdated: new Date().toISOString(),
      };
      
      console.log(`✅ Dashboard stats calculated:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ Error in getDashboardStats for organization ${organizationId}:`, error);
      throw error;
    }
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    const submission = await this.findOne(id);
    if (!submission) {
      throw new Error(`Submission with ID ${id} not found`);
    }

    // Update the submission
    Object.assign(submission, updateSubmissionDto);
    
    const updatedSubmission = await this.submissionsRepository.save(submission);
    
    // Note: Performance recalculation is now handled by frontend
    // Frontend will call POST /api/v1/performance-calculations with updated calculated scores
    if (updateSubmissionDto.responses) {
      console.log(`ℹ️ Submission updated, frontend will recalculate performance scores: ${updatedSubmission.id}`);
    }
    
    return updatedSubmission;
  }

  async autoSubmitDraftsForPeriod(periodId: string): Promise<{ submittedCount: number; submissions: Submission[] }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Find all draft submissions for this period
      const draftSubmissions = await queryRunner.manager.find(Submission, {
        where: { 
          periodId, 
          status: SubmissionStatus.DRAFT,
          isLatest: true 
        }
      });
      
      const submittedSubmissions: Submission[] = [];
      
      for (const draft of draftSubmissions) {
        // Update to submitted status
        await queryRunner.manager.update(Submission, draft.id, {
          status: SubmissionStatus.SUBMITTED,
          completed: true,
          submittedAt: new Date(),
          autoSubmittedAt: new Date(),
        });
        
        // Create file snapshots
        await this.createFileSnapshots(
          queryRunner, 
          draft.id, 
          draft.organizationId, 
          draft.periodId
        );
        
        submittedSubmissions.push(await queryRunner.manager.findOne(Submission, { where: { id: draft.id } }));
      }
      
      await queryRunner.commitTransaction();
      console.log(`🔄 Auto-submitted ${submittedSubmissions.length} drafts for period ${periodId}`);
      
      return {
        submittedCount: submittedSubmissions.length,
        submissions: submittedSubmissions
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`❌ Error auto-submitting drafts for period ${periodId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clearAll(): Promise<{ message: string; deletedCount: number }> {
    try {
      const count = await this.submissionsRepository.count();
      await this.submissionsRepository.clear();
      
      console.log(`🧹 Cleared ${count} submissions`);
      return {
        message: `Successfully cleared ${count} submissions`,
        deletedCount: count
      };
    } catch (error) {
      console.error('❌ Error clearing submissions:', error);
      throw error;
    }
  }
}
