import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber } from 'class-validator';
import { Area } from './area.entity';
import { QuestionTypeSchema } from '@ymca/shared';

@Entity('questions')
@Index(['areaId', 'sortOrder'])
@Index(['id'], { unique: true })
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  areaId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  section?: string; // e.g., "Risk Mitigation > Child Protection"

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  metric?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  prompt?: string;

  @Column({
    type: 'enum',
    enum: QuestionTypeSchema.enum,
    nullable: true
  })
  @IsOptional()
  @IsEnum(QuestionTypeSchema.enum)
  type?: string;

  @Column({ type: 'text', array: true, nullable: true })
  @IsOptional()
  @IsArray()
  options?: string[];

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  required: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  @IsOptional()
  @IsArray()
  documentsToReview?: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  dataSource?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  yusaAccess: boolean;

  @Column({ type: 'jsonb', default: {} })
  @IsOptional()
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

  @Column({ type: 'varchar', length: 50, default: 'annual', nullable: true })
  @IsOptional()
  frequency?: 'annual' | 'quarterly' | 'monthly';

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  helpText?: string;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  metadata?: {
    weight?: number;
    category?: string;
    tags?: string[];
    owner?: string;
    estimatedTime?: number; // in minutes
    difficulty?: 'easy' | 'medium' | 'hard';
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Area, area => area.questions, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  // Virtual properties
  get displayName(): string {
    return this.metric;
  }

  get fullPath(): string {
    return `${this.section} > ${this.metric}`;
  }

  get isSingleSelect(): boolean {
    return this.type === 'single_select';
  }

  get isMultiSelect(): boolean {
    return this.type === 'multi_select';
  }

  get isTextInput(): boolean {
    return this.type === 'text';
  }

  get isDateInput(): boolean {
    return this.type === 'date';
  }

  get isNumberInput(): boolean {
    return this.type === 'number';
  }

  get isFileUpload(): boolean {
    return this.type === 'file_upload';
  }

  get requiresEvidence(): boolean {
    return !!(this.validation?.evidenceRequiredIf && this.validation.evidenceRequiredIf.length > 0);
  }

  get requiresDate(): boolean {
    return this.validation?.requiresDate || false;
  }

  get requiresOwner(): boolean {
    return this.validation?.requiresOwner || false;
  }

  // Methods
  requiresEvidenceForAnswer(answer: string): boolean {
    return this.validation?.evidenceRequiredIf?.includes(answer) || false;
  }

  requiresDateForAnswer(answer: string): boolean {
    return this.validation?.requiresDateIf?.includes(answer) || false;
  }

  validateAnswer(answer: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if answer is provided for required questions
    if (this.required && (!answer || answer.trim() === '')) {
      errors.push('This question is required');
      return { isValid: false, errors };
    }

    // Validate answer against options for select types
    if (this.isSingleSelect || this.isMultiSelect) {
      if (this.options && this.options.length > 0) {
        if (this.isSingleSelect) {
          if (!this.options.includes(answer)) {
            errors.push(`Answer must be one of: ${this.options.join(', ')}`);
          }
        } else if (this.isMultiSelect) {
          const answers = Array.isArray(answer) ? answer : [answer];
          const invalidAnswers = answers.filter(a => !this.options?.includes(a));
          if (invalidAnswers.length > 0) {
            errors.push(`Invalid answers: ${invalidAnswers.join(', ')}`);
          }
        }
      }
    }

    // Validate number input
    if (this.isNumberInput && answer) {
      const numValue = parseFloat(answer);
      if (isNaN(numValue)) {
        errors.push('Answer must be a valid number');
      } else {
        if (this.validation?.minValue !== undefined && numValue < this.validation.minValue) {
          errors.push(`Value must be at least ${this.validation.minValue}`);
        }
        if (this.validation?.maxValue !== undefined && numValue > this.validation.maxValue) {
          errors.push(`Value must be at most ${this.validation.maxValue}`);
        }
      }
    }

    // Validate date input
    if (this.isDateInput && answer) {
      const dateValue = new Date(answer);
      if (isNaN(dateValue.getTime())) {
        errors.push('Answer must be a valid date');
      }
    }

    // Validate pattern for text input
    if (this.isTextInput && answer && this.validation?.pattern) {
      const regex = new RegExp(this.validation.pattern);
      if (!regex.test(answer)) {
        errors.push('Answer does not match required format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getValidationRules(): string[] {
    const rules: string[] = [];

    if (this.required) {
      rules.push('Required');
    }

    if (this.requiresEvidence) {
      rules.push(`Evidence required for: ${this.validation?.evidenceRequiredIf?.join(', ')}`);
    }

    if (this.requiresDate) {
      rules.push('Date required');
    }

    if (this.validation?.minValue !== undefined) {
      rules.push(`Minimum value: ${this.validation.minValue}`);
    }

    if (this.validation?.maxValue !== undefined) {
      rules.push(`Maximum value: ${this.validation.maxValue}`);
    }

    if (this.validation?.pattern) {
      rules.push('Must match specific format');
    }

    return rules;
  }

  getEstimatedTime(): number {
    return this.metadata?.estimatedTime || 5; // Default 5 minutes
  }

  getDifficulty(): string {
    return this.metadata?.difficulty || 'medium';
  }

  getPriority(): string {
    return this.metadata?.priority || 'medium';
  }

  isHighPriority(): boolean {
    return this.getPriority() === 'high' || this.getPriority() === 'critical';
  }

  isCritical(): boolean {
    return this.getPriority() === 'critical';
  }
}
