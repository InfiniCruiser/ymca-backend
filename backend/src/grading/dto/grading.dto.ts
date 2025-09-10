import { IsNotEmpty, IsOptional, IsString, IsNumber, IsUUID, Min, Max, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryGradeDto {
  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Score from 0 to 10', minimum: 0, maximum: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;

  @ApiProperty({ description: 'Detailed reasoning for the score', minLength: 50 })
  @IsNotEmpty()
  @IsString()
  reasoning: string;

  @ApiProperty({ description: 'Reviewer identifier' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;
}

export class SubmitGradesDto {
  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @ApiProperty({ description: 'Array of category grades', type: [CategoryGradeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryGradeDto)
  grades: CategoryGradeDto[];

  @ApiProperty({ description: 'Reviewer identifier' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateGradeDto {
  @ApiProperty({ description: 'Score from 0 to 10', minimum: 0, maximum: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;

  @ApiProperty({ description: 'Detailed reasoning for the score', minLength: 50 })
  @IsNotEmpty()
  @IsString()
  reasoning: string;

  @ApiProperty({ description: 'Reviewer identifier' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;
}

export class SubmitReviewDto {
  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @ApiProperty({ description: 'Reviewer identifier' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveSubmissionDto {
  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @ApiProperty({ description: 'Reviewer identifier' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsOptional()
  @IsString()
  approvalNotes?: string;
}

export class RejectSubmissionDto {
  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @ApiProperty({ description: 'Reviewer identifier' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiProperty({ description: 'Reason for rejection' })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional({ description: 'Detailed rejection notes' })
  @IsOptional()
  @IsString()
  rejectionNotes?: string;
}

export class OrganizationsQueryDto {
  @ApiPropertyOptional({ description: 'Period ID', example: '2024-Q1' })
  @IsOptional()
  @IsString()
  periodId?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned reviewer' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class CategoriesQueryDto {
  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  @IsNotEmpty()
  @IsString()
  periodId: string;

  @ApiPropertyOptional({ description: 'Include graded categories', default: true })
  @IsOptional()
  includeGraded?: boolean = true;
}

export class DocumentsQueryDto {
  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  @IsNotEmpty()
  @IsString()
  periodId: string;
}

export class FinalScoreQueryDto {
  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  @IsNotEmpty()
  @IsString()
  periodId: string;
}
