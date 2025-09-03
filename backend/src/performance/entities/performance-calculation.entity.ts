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
import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { Organization } from '../../organizations/entities/organization.entity';
import { Submission } from '../../submissions/entities/submission.entity';

@Entity('performance_calculations')
@Index(['organizationId', 'period'], { unique: true })
export class PerformanceCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  submissionId?: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  period: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  calculatedAt: Date;

  // Operational Performance metrics (calculated from survey responses)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  membershipGrowthScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  staffRetentionScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  graceScore?: number; // Renamed from forAllScore to match OEA terminology

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  riskMitigationScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  governanceScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  engagementScore?: number;

  // Financial Performance metrics (from OEA data structure)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  monthsOfLiquidityScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  operatingMarginScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  debtRatioScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  operatingRevenueMixScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  charitableRevenueScore?: number;

  // Aggregated scores
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  operationalTotalPoints?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  financialTotalPoints?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  totalPoints?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 80 })
  @IsNumber()
  maxPoints: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  percentageScore?: number;

  // Performance category and support designation
  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  performanceCategory?: string; // 'high', 'moderate', 'low'

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  supportDesignation?: string; // 'Y-USA Support', 'Independent Improvement', etc.

  // @Column({ type: 'boolean', default: false })
  // @IsOptional()
  // isSimulated?: boolean; // Indicates if this is simulated data vs real survey data

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  operationalSupportDesignation?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  financialSupportDesignation?: string;

  // Raw metric values (before scoring)
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  membershipGrowthValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  staffRetentionValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  graceScoreValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  monthsOfLiquidityValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  operatingMarginValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  debtRatioValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  operatingRevenueMixValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  charitableRevenueValue?: number;

  // Calculation metadata
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  calculationMetadata?: {
    calculationVersion: string;
    benchmarkYear: string;
    dataSources: string[];
    lastUpdated: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Submission, { nullable: true })
  @JoinColumn({ name: 'submissionId' })
  submission?: Submission;

  // Virtual properties
  get isHighPerformance(): boolean {
    return this.performanceCategory === 'high';
  }

  get isModeratePerformance(): boolean {
    return this.performanceCategory === 'moderate';
  }

  get isLowPerformance(): boolean {
    return this.performanceCategory === 'low';
  }

  get formattedPercentage(): string {
    return this.percentageScore ? `${this.percentageScore.toFixed(1)}%` : 'N/A';
  }

  get operationalPercentage(): string {
    return this.operationalTotalPoints ? `${((this.operationalTotalPoints / 40) * 100).toFixed(1)}%` : 'N/A';
  }

  get financialPercentage(): string {
    return this.financialTotalPoints ? `${((this.financialTotalPoints / 40) * 100).toFixed(1)}%` : 'N/A';
  }
}
