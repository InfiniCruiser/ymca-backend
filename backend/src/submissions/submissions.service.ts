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
    const submission = this.submissionsRepository.create({
      ...createSubmissionDto,
      completed: true,
    });
    
    const savedSubmission = await this.submissionsRepository.save(submission);
    
    // Automatically calculate and save performance metrics
    try {
      await this.performanceService.calculateAndSavePerformance(savedSubmission);
      console.log(`✅ Performance calculated for submission: ${savedSubmission.id}`);
    } catch (error) {
      console.error(`❌ Failed to calculate performance for submission ${savedSubmission.id}:`, error);
      // Don't fail the submission if performance calculation fails
    }
    
    return savedSubmission;
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
    
    // Recalculate performance metrics if responses were updated
    if (updateSubmissionDto.responses) {
      try {
        await this.performanceService.calculateAndSavePerformance(updatedSubmission);
        console.log(`✅ Performance recalculated for updated submission: ${updatedSubmission.id}`);
      } catch (error) {
        console.error(`❌ Failed to recalculate performance for submission ${updatedSubmission.id}:`, error);
        // Don't fail the update if performance calculation fails
      }
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
