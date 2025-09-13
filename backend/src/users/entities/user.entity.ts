import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserRoleSchema } from '@ymca/shared';

@Entity('users')
@Index(['email', 'organizationId'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  lastName?: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: UserRoleSchema.enum,
    default: UserRoleSchema.enum.PROGRAM_OWNER
  })
  @IsEnum(UserRoleSchema.enum)
  role: string;

  @Column({ type: 'text', array: true, nullable: true })
  @IsOptional()
  @IsArray()
  programAreas?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  @IsOptional()
  @IsArray()
  locations?: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  passwordHash?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiresAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  samlId?: string;

  @Column({ type: 'boolean', default: false })
  isTester: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  testerGroup?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    return this.fullName;
  }

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  // Methods
  isProgramOwner(): boolean {
    return this.role === UserRoleSchema.enum.PROGRAM_OWNER;
  }

  isAssociationAdmin(): boolean {
    return this.role === UserRoleSchema.enum.ASSOCIATION_ADMIN;
  }

  isBoardLiaison(): boolean {
    return this.role === UserRoleSchema.enum.BOARD_LIAISON;
  }

  isYusaReviewer(): boolean {
    return this.role === UserRoleSchema.enum.YUSA_REVIEWER;
  }

  isAuditor(): boolean {
    return this.role === UserRoleSchema.enum.AUDITOR;
  }

  isTestUser(): boolean {
    return this.role === UserRoleSchema.enum.TESTER || this.isTester;
  }

  hasProgramArea(area: string): boolean {
    return this.programAreas?.includes(area) || false;
  }

  hasLocation(location: string): boolean {
    return this.locations?.includes(location) || false;
  }
}
