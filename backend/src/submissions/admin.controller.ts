import { 
  Controller, 
  Post, 
  Query, 
  Body,
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CeoApprovalService } from './ceo-approval.service';
import { Submission } from './entities/submission.entity';
import { Draft } from './entities/draft.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards() // Add CEO role guard when available
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly ceoApprovalService: CeoApprovalService) {}

  @Post('approve-submission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'CEO approve submission (OPEN → LOCKED)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        organizationId: { type: 'string', description: 'Organization ID' },
        periodId: { type: 'string', description: 'Period ID' }
      },
      required: ['organizationId', 'periodId']
    }
  })
  @ApiResponse({ status: 200, description: 'Submission approved successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No submission found' })
  async approveSubmission(
    @Body('organizationId') organizationId: string,
    @Body('periodId') periodId: string,
    @Request() req: any
  ): Promise<Submission> {
    const ceoId = req.user?.sub || 'temp-ceo-id';
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    try {
      return await this.ceoApprovalService.approveSubmission(organizationId, ceoId, periodId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('NO_SUBMISSION');
      }
      throw error;
    }
  }

  @Post('reopen-submission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'CEO reopen submission (restore original draft)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        organizationId: { type: 'string', description: 'Organization ID' },
        periodId: { type: 'string', description: 'Period ID' }
      },
      required: ['organizationId', 'periodId']
    }
  })
  @ApiResponse({ status: 200, description: 'Submission reopened successfully', type: Draft })
  @ApiResponse({ status: 404, description: 'No submission found' })
  async reopenSubmission(
    @Body('organizationId') organizationId: string,
    @Body('periodId') periodId: string,
    @Request() req: any
  ): Promise<Draft> {
    const ceoId = req.user?.sub || 'temp-ceo-id';
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    try {
      return await this.ceoApprovalService.reopenSubmission(organizationId, ceoId, periodId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('NO_SUBMISSION');
      }
      throw error;
    }
  }
}
