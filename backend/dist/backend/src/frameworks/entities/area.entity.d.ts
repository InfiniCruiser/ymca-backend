import { Section } from './section.entity';
import { Question } from './question.entity';
export declare class Area {
    id: string;
    sectionId: string;
    name: string;
    description?: string;
    sortOrder: number;
    metadata?: {
        color?: string;
        icon?: string;
        weight?: number;
        requirements?: string[];
        owner?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    section: Section;
    questions: Question[];
    get displayName(): string;
    get fullPath(): string;
    get questionCount(): number;
    get requiredQuestionCount(): number;
    getQuestionById(questionId: string): Question | undefined;
    getQuestionBySortOrder(sortOrder: number): Question | undefined;
    getQuestionsByType(type: string): Question[];
    getRequiredQuestions(): Question[];
    getQuestionsRequiringEvidence(): Question[];
    getComplianceScore(responses: any[]): {
        score: number;
        total: number;
        answered: number;
    };
    getProgressStatus(responses: any[]): {
        notStarted: number;
        inProgress: number;
        needsEvidence: number;
        submitted: number;
        returned: number;
        approved: number;
    };
    getDueQuestions(responses: any[], dueDate: Date): Question[];
}
