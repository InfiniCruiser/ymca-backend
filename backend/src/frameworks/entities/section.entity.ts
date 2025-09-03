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
import { Framework } from './framework.entity';
import { Area } from './area.entity';

@Entity('sections')
@Index(['frameworkId', 'sortOrder'])
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  frameworkId: string;

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
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Framework, framework => framework.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'frameworkId' })
  framework: Framework;

  @OneToMany(() => Area, area => area.section, { cascade: true })
  areas: Area[];

  // Virtual properties
  get displayName(): string {
    return this.name;
  }

  get areaCount(): number {
    return this.areas?.length || 0;
  }

  get questionCount(): number {
    return this.areas?.reduce((total, area) => {
      return total + (area.questions?.length || 0);
    }, 0) || 0;
  }

  // Methods
  getAreaByName(name: string): Area | undefined {
    return this.areas?.find(area => area.name === name);
  }

  getAreaBySortOrder(sortOrder: number): Area | undefined {
    return this.areas?.find(area => area.sortOrder === sortOrder);
  }

  getQuestionById(questionId: string): any {
    for (const area of this.areas || []) {
      const question = area.questions?.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  }

  getQuestionsByType(type: string): any[] {
    const questions: any[] = [];
    for (const area of this.areas || []) {
      const areaQuestions = area.questions?.filter(q => q.type === type) || [];
      questions.push(...areaQuestions);
    }
    return questions;
  }

  getRequiredQuestions(): any[] {
    const questions: any[] = [];
    for (const area of this.areas || []) {
      const requiredQuestions = area.questions?.filter(q => q.required) || [];
      questions.push(...requiredQuestions);
    }
    return questions;
  }

  getComplianceScore(responses: any[]): { score: number; total: number; answered: number } {
    const totalQuestions = this.questionCount;
    if (totalQuestions === 0) {
      return { score: 0, total: 0, answered: 0 };
    }

    const sectionResponses = responses.filter(r => {
      const question = this.getQuestionById(r.questionId);
      return question !== null;
    });

    const answeredQuestions = sectionResponses.length;
    const compliantQuestions = sectionResponses.filter(r => 
      ['Yes', 'Qualified Yes'].includes(r.answer)
    ).length;

    const score = totalQuestions > 0 ? Math.round((compliantQuestions / totalQuestions) * 100) : 0;

    return {
      score,
      total: totalQuestions,
      answered: answeredQuestions
    };
  }
}
