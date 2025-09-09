import { z } from 'zod';
import { UserRoleSchema, ResponseStatusSchema } from '../types';
export declare const validateEmail: (email: string) => boolean;
export declare const validateUUID: (uuid: string) => boolean;
export declare const validateDate: (date: string) => boolean;
export declare const ROLES: {
    readonly PROGRAM_OWNER: "PROGRAM_OWNER";
    readonly ASSOCIATION_ADMIN: "ASSOCIATION_ADMIN";
    readonly BOARD_LIAISON: "BOARD_LIAISON";
    readonly YUSA_REVIEWER: "YUSA_REVIEWER";
    readonly AUDITOR: "AUDITOR";
};
export declare const ROLE_HIERARCHY: {
    readonly PROGRAM_OWNER: 1;
    readonly ASSOCIATION_ADMIN: 2;
    readonly BOARD_LIAISON: 3;
    readonly YUSA_REVIEWER: 4;
    readonly AUDITOR: 5;
};
export declare const hasPermission: (userRole: z.infer<typeof UserRoleSchema>, requiredRole: z.infer<typeof UserRoleSchema>) => boolean;
export declare const canEditResponse: (userRole: z.infer<typeof UserRoleSchema>, responseStatus: z.infer<typeof ResponseStatusSchema>) => boolean;
export declare const canReviewResponse: (userRole: z.infer<typeof UserRoleSchema>) => boolean;
export declare const canFinalizePeriod: (userRole: z.infer<typeof UserRoleSchema>) => boolean;
export declare const getStatusColor: (status: z.infer<typeof ResponseStatusSchema>) => string;
export declare const getStatusLabel: (status: z.infer<typeof ResponseStatusSchema>) => string;
export declare const isCompletedStatus: (status: z.infer<typeof ResponseStatusSchema>) => boolean;
export declare const isEditableStatus: (status: z.infer<typeof ResponseStatusSchema>) => boolean;
export declare const formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
export declare const formatDateTime: (date: Date | string) => string;
export declare const formatFileSize: (bytes: number) => string;
export declare const formatPhoneNumber: (phone: string) => string;
export declare const calculateComplianceScore: (totalQuestions: number, compliantQuestions: number) => number;
export declare const getScoreColor: (score: number) => string;
export declare const getScoreLabel: (score: number) => string;
export declare const getFileExtension: (filename: string) => string;
export declare const isImageFile: (filename: string) => boolean;
export declare const isDocumentFile: (filename: string) => boolean;
export declare const isEvidenceExpiring: (expiresOn: Date, daysThreshold?: number) => boolean;
export declare const getDaysUntilExpiry: (expiresOn: Date) => number;
export declare const searchInText: (text: string, searchTerm: string) => boolean;
export declare const filterByStatus: <T extends {
    status: string;
}>(items: T[], statuses: string[]) => T[];
export declare const filterByDateRange: <T extends {
    createdAt: Date;
}>(items: T[], startDate?: Date, endDate?: Date) => T[];
export declare const sortByField: <T>(items: T[], field: keyof T, direction?: "asc" | "desc") => T[];
export declare const buildApiUrl: (endpoint: string, params?: Record<string, any>) => string;
export declare const sanitizeUrl: (url: string) => string;
export declare const isApiError: (error: any) => error is {
    message: string;
    status?: number;
};
export declare const getErrorMessage: (error: any) => string;
export declare const CreateResponseSchema: z.ZodObject<{
    periodId: z.ZodString;
    questionId: z.ZodString;
    answer: z.ZodOptional<z.ZodString>;
    answerDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    evidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["file", "link", "integration_data"]>;
        uri: z.ZodString;
        filename: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }, {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    periodId?: string;
    questionId?: string;
    answer?: string;
    answerDate?: string;
    notes?: string;
    evidence?: {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }[];
}, {
    periodId?: string;
    questionId?: string;
    answer?: string;
    answerDate?: string;
    notes?: string;
    evidence?: {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }[];
}>;
export declare const UpdateResponseSchema: z.ZodObject<{
    periodId: z.ZodOptional<z.ZodString>;
    questionId: z.ZodOptional<z.ZodString>;
    answer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    answerDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    evidence: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["file", "link", "integration_data"]>;
        uri: z.ZodString;
        filename: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }, {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }>, "many">>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    periodId?: string;
    id?: string;
    questionId?: string;
    answer?: string;
    answerDate?: string;
    notes?: string;
    evidence?: {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }[];
}, {
    periodId?: string;
    id?: string;
    questionId?: string;
    answer?: string;
    answerDate?: string;
    notes?: string;
    evidence?: {
        type?: "link" | "file" | "integration_data";
        description?: string;
        uri?: string;
        filename?: string;
    }[];
}>;
export declare const CreatePeriodSchema: z.ZodObject<{
    organizationId: z.ZodString;
    frameworkId: z.ZodString;
    label: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodString;
    settings: z.ZodOptional<z.ZodObject<{
        allowEvidenceReuse: z.ZodBoolean;
        requireBoardApproval: z.ZodBoolean;
        autoFinalize: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        allowEvidenceReuse?: boolean;
        requireBoardApproval?: boolean;
        autoFinalize?: boolean;
    }, {
        allowEvidenceReuse?: boolean;
        requireBoardApproval?: boolean;
        autoFinalize?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    organizationId?: string;
    frameworkId?: string;
    label?: string;
    startDate?: string;
    endDate?: string;
    settings?: {
        allowEvidenceReuse?: boolean;
        requireBoardApproval?: boolean;
        autoFinalize?: boolean;
    };
}, {
    organizationId?: string;
    frameworkId?: string;
    label?: string;
    startDate?: string;
    endDate?: string;
    settings?: {
        allowEvidenceReuse?: boolean;
        requireBoardApproval?: boolean;
        autoFinalize?: boolean;
    };
}>;
export declare const CONSTANTS: {
    readonly MAX_FILE_SIZE: number;
    readonly ALLOWED_FILE_TYPES: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpeg", "image/png", "image/gif"];
    readonly EVIDENCE_EXPIRY_WARNING_DAYS: 30;
    readonly EVIDENCE_EXPIRY_CRITICAL_DAYS: 7;
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
};
