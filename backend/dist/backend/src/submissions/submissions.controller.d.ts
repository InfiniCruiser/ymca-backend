import { SubmissionsService, CreateSubmissionDto, UpdateSubmissionDto, SubmitSubmissionDto } from './submissions.service';
import { Submission } from './entities/submission.entity';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<Submission>;
    submitDraft(submitDto: SubmitSubmissionDto): Promise<Submission>;
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
    findLatestSubmission(organizationId: string, periodId: string): Promise<Submission | null>;
    findSubmissionHistory(organizationId: string, periodId: string): Promise<Submission[]>;
    findDraftSubmission(organizationId: string, periodId: string): Promise<Submission | null>;
    update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission>;
    findOne(id: string): Promise<Submission>;
    autoSubmitDraftsForPeriod(periodId: string): Promise<{
        submittedCount: number;
        submissions: Submission[];
    }>;
    clearAll(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
