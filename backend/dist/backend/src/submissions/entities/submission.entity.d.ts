import { SubmissionStatus } from './submission-status.enum';
export declare class Submission {
    id: string;
    periodId: string;
    totalQuestions?: number;
    responses: Record<string, any>;
    completed: boolean;
    submittedBy: string;
    organizationId?: string;
    version: number;
    parentSubmissionId?: string;
    isLatest: boolean;
    status: SubmissionStatus;
    submittedAt?: Date;
    autoSubmittedAt?: Date;
    discardedAt?: Date;
    discardedBy?: string;
    approvedAt?: Date;
    approvedBy?: string;
    reopenedAt?: Date;
    reopenedBy?: string;
    submittedAsSubmissionId?: string;
    createdAt: Date;
    updatedAt: Date;
}
