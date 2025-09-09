import { IsString, IsUUID, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkPeriodCompleteDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Period ID (e.g., 2024-Q1)' })
  @IsString()
  periodId: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;
}

export class ReopenPeriodDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Period ID (e.g., 2024-Q1)' })
  @IsString()
  periodId: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;
}

export class PeriodStatusResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Submission ID' })
  submissionId: string;

  @ApiProperty({ description: 'Completion status' })
  status: 'incomplete' | 'partial' | 'complete';

  @ApiProperty({ description: 'Number of completed categories' })
  completedCategories: number;

  @ApiProperty({ description: 'Total number of categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Whether period can be reopened' })
  canReopen: boolean;

  @ApiProperty({ description: 'Reopening deadline' })
  reopeningDeadline: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Missing categories', required: false })
  missingCategories?: string[];

  @ApiProperty({ description: 'First upload date' })
  firstUploadDate: string;

  @ApiProperty({ description: 'Completion date', required: false })
  completedAt?: string;
}

export class PeriodProgressResponseDto {
  @ApiProperty({ description: 'Period ID' })
  periodId: string;

  @ApiProperty({ description: 'Completion status' })
  status: 'incomplete' | 'partial' | 'complete';

  @ApiProperty({ description: 'Number of completed categories' })
  completedCategories: number;

  @ApiProperty({ description: 'Total number of categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Progress percentage' })
  progressPercentage: number;

  @ApiProperty({ description: 'Missing categories' })
  missingCategories: string[];

  @ApiProperty({ description: 'Whether period can be reopened' })
  canReopen: boolean;

  @ApiProperty({ description: 'Reopening deadline' })
  reopeningDeadline: string;

  @ApiProperty({ description: 'First upload date' })
  firstUploadDate: string;
}
