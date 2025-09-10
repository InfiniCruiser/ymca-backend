import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationDto {
  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Organization name' })
  organizationName: string;

  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'Review status' })
  status: string;

  @ApiProperty({ description: 'Total number of categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Number of graded categories' })
  gradedCategories: number;

  @ApiProperty({ description: 'Last uploaded date' })
  lastUploaded: string;

  @ApiPropertyOptional({ description: 'Due date' })
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Assigned reviewer' })
  assignedReviewer?: string;
}

export class OrganizationsResponseDto {
  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'List of organizations', type: [OrganizationDto] })
  organizations: OrganizationDto[];

  @ApiProperty({ description: 'Total count' })
  totalCount: number;

  @ApiProperty({ description: 'Has more results' })
  hasMore: boolean;
}

export class CategoryDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category name' })
  categoryName: string;

  @ApiProperty({ description: 'Has documents uploaded' })
  hasDocuments: boolean;

  @ApiProperty({ description: 'Number of documents' })
  documentCount: number;

  @ApiProperty({ description: 'Total size in bytes' })
  totalSize: number;

  @ApiProperty({ description: 'Upload date' })
  uploadedAt: string;

  @ApiPropertyOptional({ description: 'Grade assigned' })
  grade?: number;

  @ApiPropertyOptional({ description: 'Reviewer reasoning' })
  reasoning?: string;

  @ApiPropertyOptional({ description: 'Review date' })
  reviewedAt?: string;

  @ApiPropertyOptional({ description: 'Reviewer ID' })
  reviewerId?: string;
}

export class CategoriesResponseDto {
  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Organization name' })
  organizationName: string;

  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'List of categories', type: [CategoryDto] })
  categories: CategoryDto[];
}

export class DocumentFileDto {
  @ApiProperty({ description: 'Original filename' })
  originalName: string;

  @ApiProperty({ description: 'S3 key' })
  s3Key: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'MIME type' })
  type: string;

  @ApiProperty({ description: 'Upload date' })
  uploadedAt: string;
}

export class DocumentResponseDto {
  @ApiProperty({ description: 'Upload ID' })
  uploadId: string;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'List of files', type: [DocumentFileDto] })
  files: DocumentFileDto[];

  @ApiProperty({ description: 'Upload date' })
  uploadedAt: string;
}

export class DocumentUrlResponseDto {
  @ApiProperty({ description: 'Presigned URL' })
  url: string;

  @ApiProperty({ description: 'Expiration time' })
  expiresAt: string;
}

export class GradeResponseDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Score assigned' })
  score: number;

  @ApiProperty({ description: 'Reviewer reasoning' })
  reasoning: string;

  @ApiProperty({ description: 'Review date' })
  reviewedAt: string;

  @ApiProperty({ description: 'Reviewer ID' })
  reviewerId: string;
}

export class SubmitGradesResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Number of graded categories' })
  gradedCategories: number;

  @ApiProperty({ description: 'Total categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Overall progress percentage' })
  overallProgress: string;

  @ApiProperty({ description: 'List of grades', type: [GradeResponseDto] })
  grades: GradeResponseDto[];
}

export class UpdateGradeResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Updated score' })
  score: number;

  @ApiProperty({ description: 'Updated reasoning' })
  reasoning: string;

  @ApiProperty({ description: 'Review date' })
  reviewedAt: string;

  @ApiProperty({ description: 'Reviewer ID' })
  reviewerId: string;
}

export class CategoryBreakdownDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category name' })
  categoryName: string;

  @ApiProperty({ description: 'Score assigned' })
  score: number;

  @ApiProperty({ description: 'Reviewer reasoning' })
  reasoning: string;

  @ApiProperty({ description: 'Reviewer ID' })
  reviewerId: string;

  @ApiProperty({ description: 'Review date' })
  reviewedAt: string;
}

export class FinalScoreResponseDto {
  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Organization name' })
  organizationName: string;

  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'Final score' })
  finalScore: number;

  @ApiProperty({ description: 'Maximum possible score' })
  maxScore: number;

  @ApiProperty({ description: 'Percentage score' })
  percentageScore: number;

  @ApiProperty({ description: 'Performance category' })
  performanceCategory: string;

  @ApiProperty({ description: 'Category breakdown', type: [CategoryBreakdownDto] })
  categoryBreakdown: CategoryBreakdownDto[];

  @ApiProperty({ description: 'Calculation date' })
  calculatedAt: string;
}

export class ProgressResponseDto {
  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'Total categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Graded categories' })
  gradedCategories: number;

  @ApiProperty({ description: 'Pending categories' })
  pendingCategories: number;

  @ApiProperty({ description: 'Overall grade' })
  overallGrade: number;

  @ApiProperty({ description: 'Review status' })
  reviewStatus: string;

  @ApiPropertyOptional({ description: 'Assigned reviewer' })
  assignedReviewer?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  dueDate?: string;

  @ApiProperty({ description: 'Progress by category', type: [CategoryBreakdownDto] })
  progressByCategory: CategoryBreakdownDto[];
}
