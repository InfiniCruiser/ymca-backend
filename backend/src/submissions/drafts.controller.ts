import { 
  Controller, 
  Post, 
  Query, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CeoApprovalService } from './ceo-approval.service';
import { Submission } from './entities/submission.entity';
import { Draft } from './entities/draft.entity';

@ApiTags('drafts')
@Controller('drafts')
@UseGuards() // Add auth guard when available
@ApiBearerAuth()
export class DraftsController {
  constructor(private readonly ceoApprovalService: CeoApprovalService) {}

  @Post('submit-for-approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit draft for CEO approval' })
  @ApiQuery({ name: 'orgId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'period', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Draft submitted for approval successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No active draft found' })
  async submitForApproval(
    @Query('orgId') organizationId: string,
    @Query('period') periodId: string,
    @Request() req: any
  ): Promise<Submission> {
    const userId = req.user?.sub || 'temp-user-id';
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    try {
      return await this.ceoApprovalService.submitForApproval(organizationId, userId, periodId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('NO_ACTIVE_DRAFT');
      }
      throw error;
    }
  }

  @Post('start-fresh')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start fresh draft (pre-submit only)' })
  @ApiQuery({ name: 'orgId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'period', description: 'Period ID', required: true })
  @ApiResponse({ status: 201, description: 'Fresh draft created successfully', type: Draft })
  @ApiResponse({ status: 409, description: 'Submission already exists' })
  async startFresh(
    @Query('orgId') organizationId: string,
    @Query('period') periodId: string,
    @Request() req: any
  ): Promise<Draft> {
    const userId = req.user?.sub || 'temp-user-id';
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    try {
      return await this.ceoApprovalService.startFresh(organizationId, userId, periodId);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('SUBMISSION_EXISTS');
      }
      throw error;
    }
  }
}
