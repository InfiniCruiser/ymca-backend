export declare class Submission {
    id: string;
    periodId: string;
    totalQuestions: number;
    responses: Record<string, any>;
    completed: boolean;
    submittedBy: string;
    organizationId?: string;
    createdAt: Date;
    updatedAt: Date;
}
