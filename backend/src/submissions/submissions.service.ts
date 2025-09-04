import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { PerformanceService } from '../performance/performance.service';

export interface CreateSubmissionDto {
  periodId: string;
  responses: Record<string, any>;
  submittedBy?: string;
  organizationId?: string;
}

export interface UpdateSubmissionDto {
  responses?: Record<string, any>;
  completed?: boolean;
  submittedBy?: string;
}

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    private performanceService: PerformanceService,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    // Use a transaction to ensure data consistency
    const queryRunner = this.submissionsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const submission = this.submissionsRepository.create({
        ...createSubmissionDto,
        completed: true,
      });
      
      const savedSubmission = await queryRunner.manager.save(Submission, submission);
      console.log(`✅ Submission saved to database: ${savedSubmission.id}`);
      
      // Note: Performance calculation is now handled by frontend
      // Frontend will call POST /api/v1/performance-calculations with calculated scores
      console.log(`ℹ️ Submission saved, frontend will calculate performance scores: ${savedSubmission.id}`);
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      console.log(`✅ Transaction committed for submission: ${savedSubmission.id}`);
      
      return savedSubmission;
      
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      console.error(`❌ Transaction rolled back for submission creation:`, error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
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
