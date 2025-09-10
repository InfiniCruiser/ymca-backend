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

  @Column({ type: 'uuid', name: 'organizationid' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @Column({ type: 'varchar', length: 255, name: 'periodid' })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @Column({ type: 'varchar', length: 255, name: 'categoryid' })
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

  @Column({ type: 'varchar', length: 255, name: 'reviewerid' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'reviewedat' })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedat' })
  updatedAt: Date;
}
