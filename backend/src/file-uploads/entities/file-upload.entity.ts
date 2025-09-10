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
import { IsNotEmpty, IsEnum, IsOptional, IsArray, IsUUID, IsString, IsNumber, IsDateString } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Submission } from '../../submissions/entities/submission.entity';

export enum UploadType {
  MAIN = 'main',
  SECONDARY = 'secondary'
}

export interface FileMetadata {
  originalName: string;
  s3Key: string;
  size: number;
  type: string;
  uploadedAt: string;
}

@Entity('file_uploads')
@Index(['organizationId', 'periodId'])
@Index(['categoryId'])
@Index(['uploadedAt'])
@Index(['userId'])
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @Column({
    type: 'enum',
    enum: UploadType,
    default: UploadType.MAIN
  })
  @IsEnum(UploadType)
  uploadType: UploadType;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  uploadId: string;

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsArray()
  files: FileMetadata[];

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  submissionId?: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  @IsString()
  status: 'pending' | 'uploading' | 'completed' | 'failed';

  // File snapshot fields for submitted versions
  @Column({ type: 'boolean', default: false })
  @IsOptional()
  isSnapshot: boolean;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  originalUploadId?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  snapshotCreatedAt?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @Column({ type: 'timestamp with time zone' })
  @IsNotEmpty()
  @IsDateString()
  uploadedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization, { eager: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Submission, { nullable: true, eager: false })
  @JoinColumn({ name: 'submissionId' })
  submission?: Submission;

  // Virtual properties
  get totalSize(): number {
    return this.files.reduce((total, file) => total + file.size, 0);
  }

  get fileCount(): number {
    return this.files.length;
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get isFailed(): boolean {
    return this.status === 'failed';
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateFiles() {
    if (!this.files || this.files.length === 0) {
      throw new Error('Files array cannot be empty');
    }
  }
}
