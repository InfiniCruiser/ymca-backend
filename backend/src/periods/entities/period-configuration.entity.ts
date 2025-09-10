import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('period_configurations')
@Index(['periodId'], { unique: true })
@Index(['status'])
@Index(['startDate', 'endDate'])
export class PeriodConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  periodId: string; // Format: YYYY-QN (e.g., 2024-Q1)

  @Column({ type: 'varchar', length: 255 })
  label: string; // Human-readable label (e.g., "Q1 2024")

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp' })
  gracePeriodEndDate: Date; // 14 days after endDate

  @Column({
    type: 'enum',
    enum: ['upcoming', 'active', 'grace_period', 'closed'],
    default: 'upcoming',
  })
  status: 'upcoming' | 'active' | 'grace_period' | 'closed';

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Whether this period is currently active for submissions

  @Column({ type: 'int', default: 17 })
  totalCategories: number; // Number of categories required for completion

  @Column({ type: 'text', nullable: true })
  description: string; // Optional description of the period

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>; // Additional period-specific settings

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get isCurrentlyActive(): boolean {
    const now = new Date();
    return this.status === 'active' && this.isActive;
  }

  get isInGracePeriod(): boolean {
    const now = new Date();
    return this.status === 'grace_period' && now <= this.gracePeriodEndDate;
  }

  get canAcceptSubmissions(): boolean {
    return this.isCurrentlyActive || this.isInGracePeriod;
  }

  get daysRemaining(): number {
    const now = new Date();
    const endDate = this.status === 'grace_period' ? this.gracePeriodEndDate : this.endDate;
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get progressPercentage(): number {
    const now = new Date();
    const totalDuration = this.endDate.getTime() - this.startDate.getTime();
    const elapsed = now.getTime() - this.startDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }
}
