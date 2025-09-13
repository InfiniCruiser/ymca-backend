import { 
  Controller, 
  Put, 
  Query, 
  Body,
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CeoApprovalService } from './ceo-approval.service';
import { Submission } from './entities/submission.entity';

@ApiTags('submissions')
@Controller('submissions')
@UseGuards() // Add auth guard when available
@ApiBearerAuth()
export class SubmissionsController {
  constructor(private readonly ceoApprovalService: CeoApprovalService) {}

  @Put('current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit submission (only while OPEN)' })
  @ApiQuery({ name: 'orgId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'period', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Submission updated successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No submission found' })
  @ApiResponse({ status: 423, description: 'Submission is locked' })
  async editSubmission(
    @Query('orgId') organizationId: string,
    @Query('period') periodId: string,
    @Body() updates: Partial<Submission>,
    @Request() req: any
  ): Promise<Submission> {
    const userId = req.user?.sub || 'temp-user-id';
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    try {
      return await this.ceoApprovalService.editSubmission(organizationId, periodId, updates);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('NO_SUBMISSION');
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException('SUBMISSION_LOCKED');
      }
      throw error;
    }
  }
}