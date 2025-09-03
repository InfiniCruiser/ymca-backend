import { Area } from './area.entity';
export declare class Question {
    id: string;
    areaId: string;
    section: string;
    metric: string;
    prompt: string;
    type: string;
    options?: string[];
    required: boolean;
    documentsToReview?: string[];
    dataSource?: string;
    yusaAccess: boolean;
    validation: {
        evidenceRequiredIf?: string[];
        requiresDateIf?: string[];
        requiresDate?: boolean;
        requiresOwner?: boolean;
        minValue?: number;
        maxValue?: number;
        pattern?: string;
        conditionalLogic?: Array<{
            condition: string;
            action: string;
            parameters?: any;
        }>;
    };
    frequency: 'annual' | 'quarterly' | 'monthly';
    helpText?: string;
    sortOrder: number;
    metadata?: {
        weight?: number;
        category?: string;
        tags?: string[];
        owner?: string;
        estimatedTime?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
        priority?: 'low' | 'medium' | 'high' | 'critical';
    };
    createdAt: Date;
    updatedAt: Date;
    area: Area;
    get displayName(): string;
    get fullPath(): string;
    get isSingleSelect(): boolean;
    get isMultiSelect(): boolean;
    get isTextInput(): boolean;
    get isDateInput(): boolean;
    get isNumberInput(): boolean;
    get isFileUpload(): boolean;
    get requiresEvidence(): boolean;
    get requiresDate(): boolean;
    get requiresOwner(): boolean;
    requiresEvidenceForAnswer(answer: string): boolean;
    requiresDateForAnswer(answer: string): boolean;
    validateAnswer(answer: string): {
        isValid: boolean;
        errors: string[];
    };
    getValidationRules(): string[];
    getEstimatedTime(): number;
    getDifficulty(): string;
    getPriority(): string;
    isHighPriority(): boolean;
    isCritical(): boolean;
}
