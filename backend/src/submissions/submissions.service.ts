import { Injectable, BadRequestException } from '@nestjs/common';
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
      
      // Validate required fields
      if (!submissionId) {
        throw new BadRequestException('submissionId is required');
      }
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(submissionId)) {
        throw new BadRequestException(`Invalid submissionId format: ${submissionId}`);
      }
      
      // Get the draft submission
      const draftSubmission = await queryRunner.manager.findOne(Submission, {
        where: { id: submissionId, status: SubmissionStatus.DRAFT }
      });
      
      if (!draftSubmission) {
        throw new BadRequestException(`Draft submission with ID ${submissionId} not found`);
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
    console.log(`📸 Starting file snapshot creation for submission ${submissionId}...`);
    
    // Get all current draft files for this organization/period
    const draftFiles = await queryRunner.manager.find(FileUpload, {
      where: {
        organizationId,
        periodId,
        isSnapshot: false,
        submissionId: null, // Files not yet linked to a submission
      }
    });
    
    console.log(`📸 Found ${draftFiles.length} files to snapshot`);
    
    // Create snapshots in batches to avoid timeout
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < draftFiles.length; i += batchSize) {
      batches.push(draftFiles.slice(i, i + batchSize));
    }
    
    console.log(`📸 Processing ${batches.length} batches of ${batchSize} files each`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📸 Processing batch ${i + 1}/${batches.length} (${batch.length} files)`);
      
      const snapshots = batch.map(file => 
        queryRunner.manager.create(FileUpload, {
          ...file,
          id: undefined, // Generate new ID
          submissionId,
          isSnapshot: true,
          originalUploadId: file.id,
          snapshotCreatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
      
      // Save batch in one operation
      await queryRunner.manager.save(FileUpload, snapshots);
      console.log(`📸 Batch ${i + 1} saved successfully`);
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

  async getPeriodStats(organizationId: string, periodId: string) {
    try {
      console.log(`🔍 Fetching period stats for organization: ${organizationId}, period: ${periodId}`);
      
      // Get all submissions for this organization and period
      const submissions = await this.submissionsRepository.find({
        where: { organizationId, periodId },
        order: { createdAt: 'DESC' },
      });

      // Separate by status
      const draftSubmissions = submissions.filter(s => s.status === SubmissionStatus.DRAFT);
      const submittedSubmissions = submissions.filter(s => s.status === SubmissionStatus.SUBMITTED);
      const lockedSubmissions = submissions.filter(s => s.status === SubmissionStatus.LOCKED);

      // Get unique categories
      const allCategories = submissions.map(s => s.responses?.categoryId).filter(Boolean);
      const uniqueCategories = [...new Set(allCategories)];

      // Get categories by status
      const draftCategories = [...new Set(draftSubmissions.map(s => s.responses?.categoryId).filter(Boolean))];
      const submittedCategories = [...new Set(submittedSubmissions.map(s => s.responses?.categoryId).filter(Boolean))];

      // Get latest submission for each category
      const latestSubmissions = [];
      for (const category of uniqueCategories) {
        const categorySubmissions = submissions
          .filter(s => s.responses?.categoryId === category)
          .sort((a, b) => b.version - a.version);
        
        if (categorySubmissions.length > 0) {
          latestSubmissions.push(categorySubmissions[0]);
        }
      }

      // Calculate file counts and sizes
      let totalFiles = 0;
      let totalSize = 0;
      for (const submission of submissions) {
        if (submission.responses?.files) {
          totalFiles += submission.responses.files.length;
          totalSize += submission.responses.files.reduce((sum, file) => sum + (file.size || 0), 0);
        }
      }

      const result = {
        periodId,
        organizationId,
        totalSubmissions: submissions.length,
        draftSubmissions: draftSubmissions.length,
        submittedSubmissions: submittedSubmissions.length,
        lockedSubmissions: lockedSubmissions.length,
        totalCategories: uniqueCategories.length,
        draftCategories: draftCategories.length,
        submittedCategories: submittedCategories.length,
        categories: uniqueCategories,
        draftCategoriesList: draftCategories,
        submittedCategoriesList: submittedCategories,
        latestSubmissions: latestSubmissions.map(s => ({
          id: s.id,
          categoryId: s.responses?.categoryId,
          status: s.status,
          version: s.version,
          isLatest: s.isLatest,
          createdAt: s.createdAt,
          submittedAt: s.submittedAt,
          fileCount: s.responses?.files?.length || 0
        })),
        totalFiles,
        totalSize,
        lastUpdated: new Date().toISOString(),
      };
      
      console.log(`✅ Period stats calculated:`, {
        periodId,
        totalSubmissions: result.totalSubmissions,
        draftSubmissions: result.draftSubmissions,
        submittedSubmissions: result.submittedSubmissions,
        categories: result.categories.length
      });
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error in getPeriodStats for organization ${organizationId}, period ${periodId}:`, error);
      throw error;
    }
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    console.log(`🔄 Updating submission ${id} with:`, JSON.stringify(updateSubmissionDto, null, 2));
    
    try {
      const submission = await this.findOne(id);
      if (!submission) {
        throw new Error(`Submission with ID ${id} not found`);
      }

      // Update the submission
      Object.assign(submission, updateSubmissionDto);
      
      console.log(`💾 Saving updated submission ${id}...`);
      const updatedSubmission = await this.submissionsRepository.save(submission);
      console.log(`✅ Submission ${id} updated successfully`);
      
      // Note: Performance recalculation is now handled by frontend
      // Frontend will call POST /api/v1/performance-calculations with updated calculated scores
      if (updateSubmissionDto.responses) {
        console.log(`ℹ️ Submission updated, frontend will recalculate performance scores: ${updatedSubmission.id}`);
      }
      
      return updatedSubmission;
    } catch (error) {
      console.error(`❌ Error updating submission ${id}:`, error);
      throw error;
    }
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

  async deleteDraft(submissionId: string): Promise<{ message: string }> {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(submissionId)) {
        throw new BadRequestException(`Invalid submission ID format. Expected UUID, got: ${submissionId}. Please use a valid submission ID.`);
      }

      // Find the submission
      const submission = await this.submissionsRepository.findOne({
        where: { id: submissionId }
      });

      if (!submission) {
        throw new Error(`Submission with ID ${submissionId} not found`);
      }

      // Only allow deletion of draft submissions
      if (submission.status !== SubmissionStatus.DRAFT) {
        throw new Error(`Cannot delete submitted submission. Only draft submissions can be deleted.`);
      }

      // Delete the submission
      await this.submissionsRepository.delete(submissionId);
      
      console.log(`🗑️ Deleted draft submission: ${submissionId}`);
      return {
        message: `Draft submission ${submissionId} deleted successfully`
      };
    } catch (error) {
      console.error(`❌ Error deleting draft submission ${submissionId}:`, error);
      throw error;
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
