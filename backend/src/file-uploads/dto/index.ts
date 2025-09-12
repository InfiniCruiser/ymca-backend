import { IsNotEmpty, IsEnum, IsOptional, IsArray, IsUUID, IsString, IsNumber, IsDateString, ValidateNested, IsBoolean, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UploadType } from '../entities/file-upload.entity';

export class FileMetadataDto {
  @ApiProperty({ description: 'Original filename' })
  @IsNotEmpty()
  @IsString()
  originalName: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNotEmpty()
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsNotEmpty()
  @IsString()
  type: string;
}

export class GeneratePresignedUrlDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Period ID (e.g., 2024-Q1 or UUID)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\d{4}-Q[1-4]|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, {
    message: 'periodId must be either a period identifier (YYYY-QN) or a UUID'
  })
  periodId: string;

  @ApiProperty({ description: 'Category ID (e.g., strategic-plan)' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ 
    description: 'Upload type', 
    enum: UploadType,
    example: UploadType.MAIN 
  })
  @IsEnum(UploadType)
  uploadType: UploadType;

  @ApiProperty({ 
    description: 'Array of files to upload',
    type: [FileMetadataDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  files: FileMetadataDto[];

  @ApiPropertyOptional({ description: 'Optional submission ID to link uploads' })
  @IsOptional()
  @IsUUID()
  submissionId?: string;
}

export class CompleteUploadDto {
  @ApiProperty({ description: 'Upload ID from presigned URL response' })
  @IsNotEmpty()
  @IsUUID()
  uploadId: string;

  @ApiProperty({ 
    description: 'Array of successfully uploaded files',
    type: [FileMetadataDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  files: FileMetadataDto[];
}

export class FileUploadResponseDto {
  @ApiProperty({ description: 'Upload ID' })
  uploadId: string;

  @ApiProperty({ description: 'Pre-signed URLs for each file' })
  presignedUrls: Array<{
    fileIndex: number;
    url: string;
    fields: Record<string, string>;
  }>;

  @ApiProperty({ description: 'Expiration time for URLs' })
  expiresAt: string;
}

export class FileUploadStatsDto {
  @ApiProperty({ description: 'Total number of categories' })
  totalCategories: number;

  @ApiProperty({ description: 'Number of completed categories' })
  completedCategories: number;

  @ApiProperty({ description: 'Total number of files uploaded' })
  totalFiles: number;

  @ApiProperty({ description: 'Total size of all files in bytes' })
  totalSize: number;

  @ApiProperty({ description: 'Progress by category' })
  categoryProgress: Record<string, {
    mainFiles: number;
    secondaryFiles: number;
    lastUploaded: string;
  }>;
}

export class FileUploadQueryDto {
  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Filter by period ID (YYYY-QN or UUID)' })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{4}-Q[1-4]|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, {
    message: 'periodId must be either a period identifier (YYYY-QN) or a UUID'
  })
  periodId?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by upload type' })
  @IsOptional()
  @IsEnum(UploadType)
  uploadType?: UploadType;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class FileUploadProgressQueryDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Period ID (e.g., 2025-Q3 or UUID)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\d{4}-Q[1-4]|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, {
    message: 'periodId must be either a period identifier (YYYY-QN) or a UUID'
  })
  periodId: string;
}

export class FileUploadListResponseDto {
  @ApiProperty({ description: 'Array of file uploads' })
  uploads: any[];

  @ApiProperty({ description: 'Total count of uploads' })
  totalCount: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}
