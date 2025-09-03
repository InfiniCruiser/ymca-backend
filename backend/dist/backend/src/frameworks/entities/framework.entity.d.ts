import { Section } from './section.entity';
export declare class Framework {
    id: string;
    name: string;
    version: string;
    description: string;
    isActive: boolean;
    metadata?: {
        owner?: string;
        contactEmail?: string;
        lastReviewDate?: string;
        nextReviewDate?: string;
        changeLog?: Array<{
            version: string;
            date: string;
            changes: string[];
        }>;
    };
    effectiveDate?: Date;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    sections: Section[];
    get displayName(): string;
    get isCurrent(): boolean;
    get isExpired(): boolean;
    getSectionCount(): number;
    getQuestionCount(): number;
    getSectionByName(name: string): Section | undefined;
    getAreaByPath(sectionName: string, areaName: string): any;
    getQuestionById(questionId: string): any;
    validateStructure(): {
        isValid: boolean;
        errors: string[];
    };
}
