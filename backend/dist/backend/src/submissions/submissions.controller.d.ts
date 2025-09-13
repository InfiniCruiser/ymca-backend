import { CeoApprovalService } from './ceo-approval.service';
import { SubmissionsService } from './submissions.service';
import { Submission } from './entities/submission.entity';
export declare class SubmissionsController {
    private readonly ceoApprovalService;
    private readonly submissionsService;
    constructor(ceoApprovalService: CeoApprovalService, submissionsService: SubmissionsService);
    editSubmission(organizationId: string, periodId: string, updates: Partial<Submission>, req: any): Promise<Submission>;
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
}
