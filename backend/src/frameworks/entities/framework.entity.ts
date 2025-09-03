import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Section } from './section.entity';

@Entity('frameworks')
@Index(['name', 'version'], { unique: true })
export class Framework {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  version: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
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

  @Column({ type: 'timestamp', nullable: true })
  effectiveDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Section, section => section.framework)
  sections: Section[];

  // Virtual properties
  get displayName(): string {
    return `${this.name} v${this.version}`;
  }

  get isCurrent(): boolean {
    return this.isActive && (!this.expiryDate || this.expiryDate > new Date());
  }

  get isExpired(): boolean {
    return this.expiryDate ? this.expiryDate <= new Date() : false;
  }

  // Methods
  getSectionCount(): number {
    return this.sections?.length || 0;
  }

  getQuestionCount(): number {
    return this.sections?.reduce((total, section) => {
      return total + section.areas?.reduce((areaTotal, area) => {
        return areaTotal + (area.questions?.length || 0);
      }, 0) || 0;
    }, 0) || 0;
  }

  getSectionByName(name: string): Section | undefined {
    return this.sections?.find(section => section.name === name);
  }

  getAreaByPath(sectionName: string, areaName: string): any {
    const section = this.getSectionByName(sectionName);
    return section?.areas?.find(area => area.name === areaName);
  }

  getQuestionById(questionId: string): any {
    for (const section of this.sections || []) {
      for (const area of section.areas || []) {
        const question = area.questions?.find(q => q.id === questionId);
        if (question) return question;
      }
    }
    return null;
  }

  validateStructure(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.sections || this.sections.length === 0) {
      errors.push('Framework must have at least one section');
    }

    for (const section of this.sections || []) {
      if (!section.areas || section.areas.length === 0) {
        errors.push(`Section "${section.name}" must have at least one area`);
      }

      for (const area of section.areas || []) {
        if (!area.questions || area.questions.length === 0) {
          errors.push(`Area "${area.name}" in section "${section.name}" must have at least one question`);
        }

        for (const question of area.questions || []) {
          if (!question.id) {
            errors.push(`Question in area "${area.name}" must have an ID`);
          }
          if (!question.prompt) {
            errors.push(`Question ${question.id} must have a prompt`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
