import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsBoolean, IsOptional, IsInt, IsObject, Matches, Length } from 'class-validator';

export class CreatePeriodConfigurationDto {
  @ApiProperty({ description: 'Period ID in format YYYY-QN', example: '2024-Q1' })
  @IsString()
  @Matches(/^\d{4}-Q[1-4]$/, {
    message: 'periodId must be in format YYYY-QN (e.g., 2024-Q1)'
  })
  @Length(7, 7)
  periodId: string;

  @ApiProperty({ description: 'Human-readable label', example: 'Q1 2024' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Period start date', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Period end date', example: '2024-03-31T23:59:59Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Whether this period is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Number of categories required', example: 17 })
  @IsOptional()
  @IsInt()
  totalCategories?: number;

  @ApiPropertyOptional({ description: 'Period description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional period settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdatePeriodConfigurationDto {
  @ApiPropertyOptional({ description: 'Human-readable label', example: 'Q1 2024' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Period start date', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Period end date', example: '2024-03-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Period status' })
  @IsOptional()
  @IsEnum(['upcoming', 'active', 'grace_period', 'closed'])
  status?: 'upcoming' | 'active' | 'grace_period' | 'closed';

  @ApiPropertyOptional({ description: 'Whether this period is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Number of categories required', example: 17 })
  @IsOptional()
  @IsInt()
  totalCategories?: number;

  @ApiPropertyOptional({ description: 'Period description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional period settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class ActivePeriodResponseDto {
  @ApiProperty({ description: 'Current active period ID', example: '2024-Q4' })
  periodId: string;

  @ApiProperty({ description: 'Period label', example: 'Q4 2024' })
  label: string;

  @ApiProperty({ description: 'Period status', example: 'active' })
  status: 'upcoming' | 'active' | 'grace_period' | 'closed';

  @ApiProperty({ description: 'Period start date', example: '2024-10-01T00:00:00Z' })
  startDate: string;

  @ApiProperty({ description: 'Period end date', example: '2024-12-31T23:59:59Z' })
  endDate: string;

  @ApiProperty({ description: 'Grace period end date', example: '2025-01-14T23:59:59Z' })
  gracePeriodEndDate: string;

  @ApiProperty({ description: 'Days remaining in current phase', example: 45 })
  daysRemaining: number;

  @ApiProperty({ description: 'Progress percentage through the period', example: 75 })
  progressPercentage: number;

  @ApiProperty({ description: 'Whether submissions are currently accepted', example: true })
  canAcceptSubmissions: boolean;

  @ApiProperty({ description: 'Number of categories required', example: 17 })
  totalCategories: number;

  @ApiProperty({ description: 'Period description' })
  description?: string;

  @ApiProperty({ description: 'Additional period settings' })
  settings?: Record<string, any>;
}

export class PeriodConfigurationResponseDto {
  @ApiProperty({ description: 'Configuration ID' })
  id: string;

  @ApiProperty({ description: 'Period ID', example: '2024-Q1' })
  periodId: string;

  @ApiProperty({ description: 'Period label', example: 'Q1 2024' })
  label: string;

  @ApiProperty({ description: 'Period start date', example: '2024-01-01T00:00:00Z' })
  startDate: string;

  @ApiProperty({ description: 'Period end date', example: '2024-03-31T23:59:59Z' })
  endDate: string;

  @ApiProperty({ description: 'Grace period end date', example: '2024-04-14T23:59:59Z' })
  gracePeriodEndDate: string;

  @ApiProperty({ description: 'Period status', example: 'closed' })
  status: 'upcoming' | 'active' | 'grace_period' | 'closed';

  @ApiProperty({ description: 'Whether this period is active', example: false })
  isActive: boolean;

  @ApiProperty({ description: 'Number of categories required', example: 17 })
  totalCategories: number;

  @ApiProperty({ description: 'Period description' })
  description?: string;

  @ApiProperty({ description: 'Additional period settings' })
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}
