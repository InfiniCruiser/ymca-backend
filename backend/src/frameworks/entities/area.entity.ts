import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Section } from './section.entity';
import { Question } from './question.entity';

@Entity('areas')
@Index(['sectionId', 'sortOrder'])
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  sectionId?: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  metadata?: {
    color?: string;
    icon?: string;
    weight?: number;
    requirements?: string[];
    owner?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Section, section => section.areas, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'sectionId' })
  section?: Section;

  @OneToMany(() => Question, question => question.area, { cascade: true })
  questions: Question[];

  // Virtual properties
  get displayName(): string {
    return this.name;
  }

  get fullPath(): string {
    return `${this.section?.name} > ${this.name}`;
  }

  get questionCount(): number {
    return this.questions?.length || 0;
  }

  get requiredQuestionCount(): number {
    return this.questions?.filter(q => q.required).length || 0;
  }

  // Methods
  getQuestionById(questionId: string): Question | undefined {
    return this.questions?.find(question => question.id === questionId);
  }

  getQuestionBySortOrder(sortOrder: number): Question | undefined {
    return this.questions?.find(question => question.sortOrder === sortOrder);
  }

  getQuestionsByType(type: string): Question[] {
    return this.questions?.filter(question => question.type === type) || [];
  }

  getRequiredQuestions(): Question[] {
    return this.questions?.filter(question => question.required) || [];
  }

  getQuestionsRequiringEvidence(): Question[] {
    return this.questions?.filter(question => 
      question.validation?.evidenceRequiredIf && 
      question.validation.evidenceRequiredIf.length > 0
    ) || [];
  }

  getComplianceScore(responses: any[]): { score: number; total: number; answered: number } {
    const totalQuestions = this.questionCount;
    if (totalQuestions === 0) {
      return { score: 0, total: 0, answered: 0 };
    }

    const areaResponses = responses.filter(r => {
      const question = this.getQuestionById(r.questionId);
      return question !== null;
    });

    const answeredQuestions = areaResponses.length;
    const compliantQuestions = areaResponses.filter(r => 
      ['Yes', 'Qualified Yes'].includes(r.answer)
    ).length;

    const score = totalQuestions > 0 ? Math.round((compliantQuestions / totalQuestions) * 100) : 0;

    return {
      score,
      total: totalQuestions,
      answered: answeredQuestions
    };
  }

  getProgressStatus(responses: any[]): {
    notStarted: number;
    inProgress: number;
    needsEvidence: number;
    submitted: number;
    returned: number;
    approved: number;
  } {
    const statusCounts = {
      notStarted: 0,
      inProgress: 0,
      needsEvidence: 0,
      submitted: 0,
      returned: 0,
      approved: 0
    };

    for (const question of this.questions || []) {
      const response = responses.find(r => r.questionId === question.id);
      if (!response) {
        statusCounts.notStarted++;
      } else {
        statusCounts[response.status.toLowerCase() as keyof typeof statusCounts]++;
      }
    }

    return statusCounts;
  }

  getDueQuestions(responses: any[], dueDate: Date): Question[] {
    return this.questions?.filter(question => {
      const response = responses.find(r => r.questionId === question.id);
      if (!response || response.status === 'APPROVED') {
        return false;
      }
      
      // Check if question is overdue based on due date
      const lastUpdated = response.updatedAt || response.createdAt;
      return new Date(lastUpdated) < dueDate;
    }) || [];
  }
}
