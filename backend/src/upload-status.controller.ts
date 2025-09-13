import { 
  Controller, 
  Get, 
  Request,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FileUploadsService } from './file-uploads/file-uploads.service';

@ApiTags('upload-status')
@Controller('upload-status')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadStatusController {
  constructor(private readonly fileUploadsService: FileUploadsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get upload status',
    description: 'Get current upload status for an organization and period - bypasses validation issues'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Upload status retrieved successfully',
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
  async getUploadStatus(
    @Request() req: any
  ): Promise<any> {
    console.log('=== UPLOAD STATUS CONTROLLER DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request URL:', req.url);
    console.log('Query params:', req.query);
    console.log('=== END DEBUG ===');
    
    try {
      // Extract query parameters manually from request
      const organizationId = req.query?.organizationId;
      const periodId = req.query?.periodId;
      
      console.log('Extracted organizationId:', organizationId);
      console.log('Extracted periodId:', periodId);
      
      // Manual validation
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
        message: 'Upload status retrieved successfully',
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
      console.log('ERROR in getUploadStatus:', error);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }
}
