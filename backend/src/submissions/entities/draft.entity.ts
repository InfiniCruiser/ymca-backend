import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IsEnum, IsOptional, IsNumber, IsBoolean, IsUUID, IsString } from 'class-validator';

export enum DraftStatus {
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

@Entity('drafts')
@Index(['organizationId', 'periodId', 'status'])
export class Draft {
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

  @Column({ type: 'int', default: 1 })
  @IsNumber()
  version: number;

  @Column({
    type: 'enum',
    enum: DraftStatus,
    default: DraftStatus.DRAFT
  })
  @IsEnum(DraftStatus)
  status: DraftStatus;

  // Relationship field for draft to submission linking
  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  submittedAsSubmissionId?: string;

  // Audit fields for CEO actions
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  reopenedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  reopenedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
