import { SubmissionsService, CreateSubmissionDto, UpdateSubmissionDto, SubmitSubmissionDto } from './submissions.service';
import { Submission } from './entities/submission.entity';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<Submission>;
    submitDraft(submitDto: SubmitSubmissionDto): Promise<Submission>;
    createNewDraft(createSubmissionDto: CreateSubmissionDto): Promise<Submission>;
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
    getPeriodStats(organizationId: string, periodId: string): Promise<{
        periodId: string;
        organizationId: string;
        totalSubmissions: number;
        draftSubmissions: number;
        submittedSubmissions: number;
        lockedSubmissions: number;
        totalCategories: number;
        draftCategories: number;
        submittedCategories: number;
        categories: any[];
        draftCategoriesList: any[];
        submittedCategoriesList: any[];
        latestSubmissions: {
            id: any;
            categoryId: any;
            status: any;
            version: any;
            isLatest: any;
            createdAt: any;
            submittedAt: any;
            fileCount: any;
        }[];
        totalFiles: number;
        totalSize: number;
        lastUpdated: string;
    }>;
    findByPeriodId(periodId: string): Promise<Submission[]>;
    findLatestSubmission(organizationId: string, periodId: string): Promise<Submission | null>;
    findSubmissionHistory(organizationId: string, periodId: string): Promise<Submission[]>;
    findDraftSubmission(organizationId: string, periodId: string): Promise<Submission | null>;
    update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission>;
    findOne(id: string): Promise<Submission>;
    deleteDraft(id: string): Promise<{
        message: string;
    }>;
    autoSubmitDraftsForPeriod(periodId: string): Promise<{
        submittedCount: number;
        submissions: Submission[];
    }>;
    startFreshDraft(orgId: string, periodId: string, req: any): Promise<{
        id: string;
        version: number;
        status: string;
        s3SubmissionId?: string;
    }>;
    clearAll(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
