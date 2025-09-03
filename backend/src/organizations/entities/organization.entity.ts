import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum OrganizationType {
  LOCAL_Y = 'LOCAL_Y',
  REGIONAL = 'REGIONAL',
  NATIONAL = 'NATIONAL'
}

export enum YMCAStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  MERGED = 'Merged'
}

export enum YMCAType {
  CORPORATE_ASSOCIATION = 'Corporate Association',
  INDEPENDENT_CAMP = 'Independent Camp or Conference Center'
}

export enum FacilityType {
  FACILITY = 'Facility',
  NON_FACILITY = 'Non-Facility',
  RESIDENT_CAMP = 'Resident Camp'
}

export enum BudgetRange {
  UNDER_650K = 'Under $650,000',
  SIX_FIFTY_TO_1M = '$650,001-$1,000,000',
  ONE_TO_2M = '$1,000,001-$2,000,000',
  TWO_TO_4M = '$2,000,001-$4,000,000',
  FOUR_TO_14M = '$4,000,001-$14,000,000',
  OVER_14M = 'Over $14,000,000'
}

export enum MemberGroup {
  SMALL_MID_SIZE = 'Small & Mid Size',
  MID_MAJOR = 'Mid-Major',
  YNAN = 'YNAN'
}

@Entity('organizations')
@Index(['code'], { unique: true })
@Index(['associationNumber'], { unique: true })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  code: string;

  // YMCA Association Number (from CSV) - This is the unique identifier
  @Column({ type: 'varchar', length: 10, nullable: true })
  @IsOptional()
  associationNumber?: string;

  @Column({
    type: 'enum',
    enum: OrganizationType,
    default: OrganizationType.LOCAL_Y
  })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  parentId?: string;

  // YMCA-specific fields from CSV
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  doingBusinessAs?: string;

  @Column({
    type: 'enum',
    enum: FacilityType,
    nullable: true
  })
  @IsOptional()
  facilityType?: FacilityType;

  @Column({ type: 'boolean', default: true })
  isAssociation: boolean = true;

  @Column({ type: 'boolean', default: true })
  isChartered: boolean = true;

  @Column({ type: 'boolean', default: false })
  isLearningCenter: boolean = false;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  charterStatus?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  charterDate?: Date;

  @Column({ type: 'int', default: 0 })
  associationBranchCount: number = 0;

  @Column({
    type: 'enum',
    enum: BudgetRange,
    nullable: true
  })
  @IsOptional()
  budgetRange?: BudgetRange;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  crmProvider?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  closedDate?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  closureReason?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  completedMergeDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  @IsOptional()
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  @IsOptional()
  longitude?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  level?: string;

  @Column({
    type: 'enum',
    enum: MemberGroup,
    nullable: true
  })
  @IsOptional()
  memberGroup?: MemberGroup;

  @Column({ type: 'boolean', default: false })
  nwmParticipant: boolean = false;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  learningRegion?: string;

  @Column({
    type: 'enum',
    enum: YMCAStatus,
    default: YMCAStatus.OPEN
  })
  @IsOptional()
  yStatus?: YMCAStatus;

  @Column({
    type: 'enum',
    enum: YMCAType,
    nullable: true
  })
  @IsOptional()
  yType?: YMCAType;

  @Column({ type: 'boolean', default: false })
  yessParticipant: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  alliancePartner?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  financeSystem?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  affiliateGroup?: string;

  // Pilot program fields
  @Column({ type: 'boolean', default: false })
  potentialPilotInvite: boolean = false;

  @Column({ type: 'boolean', default: false })
  invited: boolean = false;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  inviteResponse?: string;

  @Column({ type: 'boolean', default: false })
  receivedDavidQ: boolean = false;

  @Column({ type: 'boolean', default: false })
  participatedInPilot1: boolean = false;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  notes?: string;

  // Contact Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  ceoName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  address1?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  city?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  @IsOptional()
  state?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  @IsOptional()
  zipCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  phone?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  fax?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  website?: string;

  // Existing settings and metadata
  @Column({ type: 'jsonb', default: {} })
  @IsOptional()
  @IsObject()
  settings: {
    timezone: string;
    fiscalYearStart: string;
    defaultFrameworkVersion: string;
    allowEvidenceReuse: boolean;
    requireBoardApproval: boolean;
    autoFinalize: boolean;
    notificationSettings: {
      email: boolean;
      slack: boolean;
      reminders: {
        enabled: boolean;
        frequency: 'daily' | 'weekly';
        daysBeforeDue: number[];
      };
    };
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Organization;

  @OneToMany(() => Organization, org => org.parent)
  children?: Organization[]
}
