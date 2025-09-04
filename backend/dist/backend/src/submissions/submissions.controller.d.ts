import { SubmissionsService, CreateSubmissionDto, UpdateSubmissionDto } from './submissions.service';
import { Submission } from './entities/submission.entity';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<Submission>;
    findAll(): Promise<Submission[]>;
    getStats(): Promise<{
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
    findByPeriodId(periodId: string): Promise<Submission[]>;
    update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission>;
    findOne(id: string): Promise<Submission>;
    clearAll(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
