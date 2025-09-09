import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('period_completions')
@Index(['organizationId', 'periodId'])
@Index(['submissionId'])
@Index(['firstUploadDate'])
export class PeriodCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  periodId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  submissionId: string;

  @Column({
    type: 'enum',
    enum: ['incomplete', 'partial', 'complete'],
    default: 'incomplete',
  })
  status: string;

  @Column({ type: 'int', default: 17 })
  totalCategories: number;

  @Column({ type: 'int', default: 0 })
  completedCategories: number;

  @Column({ type: 'timestamp', nullable: true })
  firstUploadDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'boolean', default: true })
  canReopen: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
