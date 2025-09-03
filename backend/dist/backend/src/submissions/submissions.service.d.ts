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
export declare class SubmissionsService {
    private submissionsRepository;
    private performanceService;
    constructor(submissionsRepository: Repository<Submission>, performanceService: PerformanceService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<Submission>;
    findAll(): Promise<Submission[]>;
    findOne(id: string): Promise<Submission>;
    findByPeriodId(periodId: string): Promise<Submission[]>;
    getSubmissionStats(): Promise<{
        total: number;
        completed: number;
        pending: number;
    }>;
    getDashboardStats(organizationId: string): Promise<{
        activePeriods: number;
        overdueResponses: number;
        pendingReviews: number;
        complianceScore: number;
        totalSubmissions: number;
        completedSubmissions: number;
        organizationId: string;
        lastUpdated: string;
    }>;
    update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission>;
    clearAll(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
