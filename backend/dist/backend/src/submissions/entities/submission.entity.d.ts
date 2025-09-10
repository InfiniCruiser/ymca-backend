import { SubmissionStatus } from './submission-status.enum';
export declare class Submission {
    id: string;
    periodId: string;
    totalQuestions: number;
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
    createdAt: Date;
    updatedAt: Date;
}
