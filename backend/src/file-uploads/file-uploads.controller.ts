import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus, 
  Request,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { FileUploadsService } from './file-uploads.service';
import { 
  GeneratePresignedUrlDto, 
  CompleteUploadDto, 
  FileUploadResponseDto, 
  FileUploadQueryDto,
  FileUploadListResponseDto,
  FileUploadStatsDto
} from './dto';
import { FileUpload } from './entities/file-upload.entity';

// Note: You'll need to create or import your JWT auth guard
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('file-uploads')
@Controller('file-uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadsController {
  constructor(private readonly fileUploadsService: FileUploadsService) {}

  @Post('presigned-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generate presigned URLs for file uploads',
    description: 'Generate secure presigned URLs for direct S3 uploads. Returns URLs that expire in 1 hour.'
  })
  @ApiBody({ type: GeneratePresignedUrlDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Presigned URLs generated successfully',
    type: FileUploadResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file data or validation failed' 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - user does not have access to organization' })
  async generatePresignedUrl(
    @Body() generatePresignedUrlDto: GeneratePresignedUrlDto,
    @Request() req: any
  ): Promise<FileUploadResponseDto> {
    // Extract userId from JWT token
    const userId = req.user.sub;

    // Validate user has access to organizationId
    if (req.user.organizationId !== generatePresignedUrlDto.organizationId) {
      throw new ForbiddenException('Access denied to organization');
    }

    return this.fileUploadsService.generatePresignedUrl(generatePresignedUrlDto, userId);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Complete file upload process',
    description: 'Mark file uploads as completed after successful S3 upload'
  })
  @ApiBody({ type: CompleteUploadDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Upload completed successfully',
    type: FileUpload
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Upload record not found' 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  async completeUpload(
    @Body() completeUploadDto: CompleteUploadDto,
    @Request() req: any
  ): Promise<FileUpload> {
    // Extract userId from JWT token
    const userId = req.user.sub;

    return this.fileUploadsService.completeUpload(completeUploadDto, userId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get file uploads with filtering',
    description: 'Retrieve file uploads with optional filtering by organization, period, category, etc.'
  })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Filter by organization ID' })
  @ApiQuery({ name: 'periodId', required: false, description: 'Filter by period ID' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'uploadType', required: false, description: 'Filter by upload type (main/secondary)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (pending/uploading/completed/failed)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({ 
    status: 200, 
    description: 'File uploads retrieved successfully',
    type: FileUploadListResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  async findAll(
    @Query() query: FileUploadQueryDto,
    @Request() req: any
  ): Promise<FileUploadListResponseDto> {
    // Extract userId and organizationId from JWT token
    const userId = req.user.sub;
    const userOrganizationId = req.user.organizationId;

    return this.fileUploadsService.findAll(query, userId, userOrganizationId);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get file upload statistics',
    description: 'Get aggregated statistics about file uploads for an organization and period'
  })
  @ApiQuery({ name: 'organizationId', required: true, description: 'Organization ID' })
  @ApiQuery({ name: 'periodId', required: false, description: 'Period ID (optional)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully',
    type: FileUploadStatsDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - user does not have access to organization' })
  async getUploadStats(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId?: string,
    @Request() req?: any
  ): Promise<FileUploadStatsDto> {
    // TODO: Validate user has access to organizationId when auth is implemented
    // if (req.user.organizationId !== organizationId) {
    //   throw new ForbiddenException('Access denied to organization');
    // }

    return this.fileUploadsService.getUploadStats(organizationId, periodId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get file upload by ID',
    description: 'Retrieve a specific file upload by its ID'
  })
  @ApiParam({ name: 'id', description: 'File upload ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'File upload retrieved successfully',
    type: FileUpload
  })
  @ApiResponse({ 
    status: 404, 
    description: 'File upload not found' 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - user does not have access to this upload' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ): Promise<FileUpload> {
    // Extract userId and organizationId from JWT token
    const userId = req.user.sub;
    const userOrganizationId = req.user.organizationId;

    return this.fileUploadsService.findOne(id, userId, userOrganizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete file upload',
    description: 'Delete a file upload record and associated S3 files'
  })
  @ApiParam({ name: 'id', description: 'File upload ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'File upload deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'File upload not found' 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - user does not have access to this upload' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ): Promise<void> {
    // Extract userId and organizationId from JWT token
    const userId = req.user.sub;
    const userOrganizationId = req.user.organizationId;

    return this.fileUploadsService.remove(id, userId, userOrganizationId);
  }
}
