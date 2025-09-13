import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { SubmissionStatus } from './entities/submission-status.enum';

export interface DraftPayload {
  responses?: Record<string, any>;
  submittedBy?: string;
  organizationId?: string;
  periodId?: string;
}

export interface GetActiveDraftDto {
  organizationId: string;
  periodId: string;
  userId: string;
}

export interface UpsertDraftDto {
  organizationId: string;
  periodId: string;
  userId: string;
  responses: Record<string, any>;
}

export interface StartFreshDraftDto {
  organizationId: string;
  periodId: string;
  userId: string;
  responses?: Record<string, any>;
}

export interface SubmitDraftDto {
  organizationId: string;
  periodId: string;
  userId: string;
}

@Injectable()
export class DraftService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    private dataSource: DataSource,
  ) {}

  async getActiveDraft(orgId: string, userId: string, periodId: string): Promise<Submission | null> {
    return this.submissionsRepository.findOne({
      where: { 
        organizationId: orgId, 
        submittedBy: userId, 
        periodId, 
        status: SubmissionStatus.OPEN 
      },
      order: { createdAt: 'DESC' }
    });
  }

  async getNextVersion(orgId: string, userId: string, periodId: string): Promise<number> {
    const result = await this.submissionsRepository
      .createQueryBuilder('submission')
      .select('MAX(submission.version)', 'maxVersion')
      .where('submission.organizationId = :orgId', { orgId })
      .andWhere('submission.submittedBy = :userId', { userId })
      .andWhere('submission.periodId = :periodId', { periodId })
      .getRawOne();

    return (result?.maxVersion || 0) + 1;
  }

  async upsertActiveDraft(orgId: string, userId: string, periodId: string, patch: Partial<DraftPayload>): Promise<Submission> {
    return this.dataSource.transaction(async (manager) => {
      // Lock the active draft row if exists
      const activeDraft = await manager
        .createQueryBuilder(Submission, 'submission')
        .where('submission.organizationId = :orgId', { orgId })
        .andWhere('submission.submittedBy = :userId', { userId })
        .andWhere('submission.periodId = :periodId', { periodId })
        .andWhere('submission.status = :status', { status: SubmissionStatus.OPEN })
        .setLock('pessimistic_write')
        .getOne();

      if (activeDraft) {
        // Update existing draft in place
        await manager.update(Submission, activeDraft.id, {
          ...patch,
          updatedAt: new Date()
        });
        
        console.log(`✅ Draft updated: ${activeDraft.id} (v${activeDraft.version})`);
        return await manager.findOne(Submission, { where: { id: activeDraft.id } });
      } else {
        // Create new draft with next version
        const version = await this.getNextVersion(orgId, userId, periodId);
        
        try {
          const newDraft = manager.create(Submission, {
            organizationId: orgId,
            submittedBy: userId,
            periodId,
            version,
            status: SubmissionStatus.OPEN,
            completed: false,
            isLatest: true,
            responses: patch.responses || {},
            ...patch
          });

          const savedDraft = await manager.save(Submission, newDraft);
          console.log(`✅ New draft created: ${savedDraft.id} (v${version})`);
          return savedDraft;
        } catch (error) {
          // If unique constraint violation, retry by fetching and updating
          if (error.code === '23505' && error.constraint === 'ux_draft_active_tuple') {
            const nowActive = await manager.findOne(Submission, {
              where: { 
                organizationId: orgId, 
                submittedBy: userId, 
                periodId, 
                status: SubmissionStatus.OPEN 
              }
            });
            
            if (nowActive) {
              await manager.update(Submission, nowActive.id, {
                ...patch,
                updatedAt: new Date()
              });
              return await manager.findOne(Submission, { where: { id: nowActive.id } });
            }
          }
          throw error;
        }
      }
    });
  }

  async startFresh(orgId: string, userId: string, periodId: string, seed?: Partial<DraftPayload>): Promise<Submission> {
    return this.dataSource.transaction(async (manager) => {
      // Archive current active draft if any
      await manager.update(Submission, 
        { 
          organizationId: orgId, 
          submittedBy: userId, 
          periodId, 
          status: SubmissionStatus.OPEN 
        },
        { 
          status: SubmissionStatus.ARCHIVED,
          discardedAt: new Date(),
          discardedBy: userId
        }
      );

      const version = await this.getNextVersion(orgId, userId, periodId);
      
      const newDraft = manager.create(Submission, {
        organizationId: orgId,
        submittedBy: userId,
        periodId,
        version,
        status: SubmissionStatus.OPEN,
        completed: false,
        isLatest: true,
        responses: seed?.responses || {},
        ...seed
      });

      const savedDraft = await manager.save(Submission, newDraft);
      console.log(`✅ Fresh draft started: ${savedDraft.id} (v${version})`);
      return savedDraft;
    });
  }

  async submitDraft(orgId: string, userId: string, periodId: string): Promise<Submission> {
    return this.dataSource.transaction(async (manager) => {
      const activeDraft = await manager.findOne(Submission, {
        where: { 
          organizationId: orgId, 
          submittedBy: userId, 
          periodId, 
          status: SubmissionStatus.OPEN 
        }
      });

      if (!activeDraft) {
        throw new NotFoundException('No active draft found for submission');
      }

      // Update submission to submitted status
      await manager.update(Submission, activeDraft.id, {
        status: SubmissionStatus.LOCKED,
        completed: true,
        submittedAt: new Date(),
        submittedBy: userId,
      });

      console.log(`✅ Draft submitted: ${activeDraft.id} (v${activeDraft.version})`);
      return await manager.findOne(Submission, { where: { id: activeDraft.id } });
    });
  }
}
