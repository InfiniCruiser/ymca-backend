import { Repository, DataSource } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { PerformanceService } from '../performance/performance.service';
import { DraftService } from './draft.service';
export interface CreateSubmissionDto {
    periodId: string;
    responses: Record<string, any>;
    submittedBy?: string;
    organizationId?: string;
    isDraft?: boolean;
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
export declare class SubmissionsService {
    private submissionsRepository;
    private fileUploadRepository;
    private dataSource;
    private performanceService;
    private draftService;
    constructor(submissionsRepository: Repository<Submission>, fileUploadRepository: Repository<FileUpload>, dataSource: DataSource, performanceService: PerformanceService, draftService: DraftService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<Submission>;
    submitDraft(submitDto: SubmitSubmissionDto): Promise<Submission>;
    createNewDraft(createSubmissionDto: CreateSubmissionDto): Promise<Submission>;
    private createFileSnapshots;
    findAll(): Promise<Submission[]>;
    findOne(id: string): Promise<Submission>;
    private extractSubmissionIdFromS3Key;
    findByPeriodId(periodId: string): Promise<Submission[]>;
    findLatestSubmission(organizationId: string, periodId: string): Promise<Submission | null>;
    findSubmissionHistory(organizationId: string, periodId: string): Promise<Submission[]>;
    findDraftSubmission(organizationId: string, periodId: string): Promise<Submission | null>;
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
    update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission>;
    autoSubmitDraftsForPeriod(periodId: string): Promise<{
        submittedCount: number;
        submissions: Submission[];
    }>;
    deleteDraft(submissionId: string): Promise<{
        message: string;
    }>;
    startFreshDraft(organizationId: string, userId: string, periodId: string): Promise<{
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
