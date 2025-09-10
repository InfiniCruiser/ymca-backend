import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsUUID, Min, Max } from 'class-validator';

@Entity('document_category_grades')
@Index(['organizationId', 'periodId', 'categoryId'], { unique: true })
@Index(['organizationId', 'periodId'])
@Index(['categoryId'])
@Index(['reviewerId'])
export class DocumentCategoryGrade {
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

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  reasoning: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
