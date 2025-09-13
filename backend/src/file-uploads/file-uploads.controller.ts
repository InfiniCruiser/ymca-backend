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
  ForbiddenException,
  UsePipes,
  ValidationPipe
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
  FileUploadStatsDto,
  FileUploadProgressQueryDto
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

  @Get('progress')
  @ApiOperation({ 
    summary: 'Get upload progress',
    description: 'Get current upload progress for an organization and period'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Upload progress retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        status: { type: 'string' },
        completedCategories: { type: 'number' },
        totalCategories: { type: 'number' },
        categoriesWithFiles: { type: 'number' },
        totalFiles: { type: 'number' },
        totalSize: { type: 'number' },
        categoryProgress: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid organizationId or periodId' 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - user does not have access to organization' })
  async getProgress(
    @Request() req: any
  ): Promise<any> {
    console.log('=== PROGRESS ENDPOINT DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Query params:', req.query);
    console.log('Query string:', req.queryString);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('User from JWT:', req.user);
    console.log('Raw request body:', req.body);
    console.log('Request params:', req.params);
    console.log('=== END DEBUG ===');
    
    try {
      // Extract query parameters manually from request
      const organizationId = req.query?.organizationId;
      const periodId = req.query?.periodId;
      
      console.log('Extracted organizationId:', organizationId);
      console.log('Extracted periodId:', periodId);
      
      // Manual validation to bypass DTO validation issues
      if (!organizationId || !periodId) {
        console.log('Missing required parameters');
        throw new ForbiddenException('organizationId and periodId are required');
      }
      
      // Validate user has access to organizationId
      if (req.user.organizationId !== organizationId) {
        console.log('Access denied - organization mismatch');
        throw new ForbiddenException('Access denied to organization');
      }
      
      console.log('About to call getUploadStats...');
      // Get current upload stats
      const stats = await this.fileUploadsService.getUploadStats(organizationId, periodId);
      console.log('getUploadStats completed successfully');
      
      const result = {
        success: true,
        message: 'Upload progress retrieved successfully',
        status: stats.completedCategories > 0 ? 'incomplete' : 'not_started',
        completedCategories: stats.completedCategories,
        totalCategories: stats.totalCategories,
        categoriesWithFiles: stats.completedCategories,
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        categoryProgress: stats.categoryProgress
      };
      
      console.log('Returning result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log('ERROR in getProgress:', error);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  @Post('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Save upload progress (draft system)',
    description: 'In draft system, progress is tracked locally. This endpoint returns current status.'
  })
  @ApiBody({ 
    description: 'Upload progress data (stored locally in draft system)',
    schema: {
      type: 'object',
      properties: {
        submissionId: { type: 'string' },
        version: { type: 'number' },
        status: { type: 'string' },
        mainFiles: { type: 'number' },
        secondaryFiles: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Progress status returned (draft system uses local storage)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        status: { type: 'string' },
        completedCategories: { type: 'number' },
        totalCategories: { type: 'number' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  async saveProgress(
    @Body() progressData: any,
    @Request() req: any
  ): Promise<any> {
    // In draft system: Progress is tracked locally, not on server
    // Return current status based on actual file uploads
    const userId = req.user.sub;
    const userOrganizationId = req.user.organizationId;
    
    // Get current upload stats
    const stats = await this.fileUploadsService.getUploadStats(userOrganizationId);
    
    return {
      success: true,
      message: 'Progress tracked locally in draft system',
      status: 'incomplete', // Always incomplete until full submission
      completedCategories: 0, // Always 0 in draft system
      totalCategories: 17,
      categoriesWithFiles: stats.completedCategories // Categories that have files uploaded
    };
  }

  @Get(':id/download-urls')
  @ApiOperation({ 
    summary: 'Generate presigned download URLs for file upload',
    description: 'Generate presigned download URLs for all files in a specific upload. Used by grading portal to access files for review.'
  })
  @ApiParam({ name: 'id', description: 'File upload ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Download URLs generated successfully',
    schema: {
      type: 'object',
      properties: {
        uploadId: { type: 'string' },
        submissionId: { type: 'string' },
        organizationId: { type: 'string' },
        periodId: { type: 'string' },
        categoryId: { type: 'string' },
        uploadType: { type: 'string' },
        status: { type: 'string' },
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalName: { type: 'string' },
              s3Key: { type: 'string' },
              size: { type: 'number' },
              type: { type: 'string' },
              uploadedAt: { type: 'string' },
              bucket: { type: 'string' },
              downloadUrl: { type: 'string' },
              expiresAt: { type: 'string' }
            }
          }
        },
        uploadedAt: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'File upload not found' 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - user does not have access to this upload' })
  async generateDownloadUrls(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.sub;
    const userOrganizationId = req.user.organizationId;

    return this.fileUploadsService.generateDownloadUrls(id, userId, userOrganizationId);
  }

  @Get('debug-token')
  @ApiOperation({ 
    summary: 'Debug JWT token (temporary)',
    description: 'Debug endpoint to check JWT token validity and user info'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token debug info',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        user: { type: 'object' },
        tokenInfo: { type: 'object' }
      }
    }
  })
  async debugToken(@Request() req: any): Promise<any> {
    return {
      valid: true,
      user: req.user,
      tokenInfo: {
        hasUser: !!req.user,
        userId: req.user?.sub,
        email: req.user?.email,
        role: req.user?.role,
        organizationId: req.user?.organizationId,
        isTester: req.user?.isTester
      }
    };
  }

  @Get('submission/:submissionId/download-urls')
  @ApiOperation({ 
    summary: 'Generate presigned download URLs for all files in a submission',
    description: 'Generate presigned download URLs for all files across all uploads in a submission. Used by grading portal to access all files for review.'
  })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Download URLs generated successfully for all files in submission',
    schema: {
      type: 'object',
      properties: {
        submissionId: { type: 'string' },
        totalFiles: { type: 'number' },
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalName: { type: 'string' },
              s3Key: { type: 'string' },
              size: { type: 'number' },
              type: { type: 'string' },
              uploadedAt: { type: 'string' },
              bucket: { type: 'string' },
              downloadUrl: { type: 'string' },
              expiresAt: { type: 'string' },
              uploadId: { type: 'string' },
              categoryId: { type: 'string' },
              uploadType: { type: 'string' }
            }
          }
        },
        generatedAt: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No files found for this submission' 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - user does not have access to this submission' })
  async generateDownloadUrlsForSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.sub;
    const userOrganizationId = req.user.organizationId;

    return this.fileUploadsService.generateDownloadUrlsForSubmission(submissionId, userId, userOrganizationId);
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
