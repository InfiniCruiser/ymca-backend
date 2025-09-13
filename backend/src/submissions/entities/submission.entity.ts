import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IsEnum, IsOptional, IsNumber, IsBoolean, IsUUID, IsString } from 'class-validator';
import { SubmissionStatus } from './submission-status.enum';

@Entity('submissions')
@Index(['organizationId', 'periodId', 'isLatest'])
@Index(['organizationId', 'periodId', 'version'])
@Index(['status'])
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  periodId: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  totalQuestions?: number;

  @Column({ type: 'jsonb' })
  responses: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  completed: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  submittedBy: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  // New versioning fields
  @Column({ type: 'int', default: 1 })
  @IsNumber()
  version: number;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  parentSubmissionId?: string;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isLatest: boolean;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT
  })
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  submittedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  autoSubmittedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  discardedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  discardedBy?: string;

  // CEO approval flow audit fields
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  approvedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  reopenedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  reopenedBy?: string;

  // Relationship field for draft to submission linking
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  submittedAsSubmissionId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
