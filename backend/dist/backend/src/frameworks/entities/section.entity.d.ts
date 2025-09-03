import { Framework } from './framework.entity';
import { Area } from './area.entity';
export declare class Section {
    id: string;
    frameworkId: string;
    name: string;
    description?: string;
    sortOrder: number;
    metadata?: {
        color?: string;
        icon?: string;
        weight?: number;
        requirements?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    framework: Framework;
    areas: Area[];
    get displayName(): string;
    get areaCount(): number;
    get questionCount(): number;
    getAreaByName(name: string): Area | undefined;
    getAreaBySortOrder(sortOrder: number): Area | undefined;
    getQuestionById(questionId: string): any;
    getQuestionsByType(type: string): any[];
    getRequiredQuestions(): any[];
    getComplianceScore(responses: any[]): {
        score: number;
        total: number;
        answered: number;
    };
}
