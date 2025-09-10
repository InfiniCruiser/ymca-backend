import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ReviewAction {
  GRADED = 'graded',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  STATUS_CHANGED = 'status_changed'
}

@Entity('review_history')
@Index(['organizationId', 'periodId'])
@Index(['performedBy'])
@Index(['action'])
@Index(['performedAt'])
export class ReviewHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Column({
    type: 'enum',
    enum: ReviewAction
  })
  @IsNotEmpty()
  action: ReviewAction;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  performedBy: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  performedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  details?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
