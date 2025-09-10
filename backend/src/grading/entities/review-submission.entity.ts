import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

export enum ReviewStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in-review',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('review_submissions')
@Index(['organizationId', 'periodId'], { unique: true })
@Index(['status'])
@Index(['submittedBy'])
@Index(['approvedBy'])
export class ReviewSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'organizationId' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @Column({ type: 'varchar', length: 255, name: 'periodId' })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  submittedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  submittedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  approvedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  rejectedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  rejectedAt?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  approvalNotes?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  rejectionNotes?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  finalScore?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
