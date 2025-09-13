import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Query, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  NotFoundException,
  ConflictException,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CeoApprovalService, WorkResult } from './ceo-approval.service';
import { Submission } from './entities/submission.entity';
import { Draft } from './entities/draft.entity';

@ApiTags('period-work')
@Controller('period')
@UseGuards() // Add auth guard when available
@ApiBearerAuth()
export class CeoApprovalController {
  constructor(private readonly ceoApprovalService: CeoApprovalService) {}

  @Get('work')
  @ApiOperation({ summary: 'Get current work entity (draft, submission, or empty)' })
  @ApiQuery({ name: 'orgId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'period', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Work entity retrieved successfully' })
  async getWork(
    @Query('orgId') organizationId: string,
    @Query('period') periodId: string,
    @Request() req: any
  ): Promise<WorkResult> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.sub || 'temp-user-id';
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    return this.ceoApprovalService.getWork(organizationId, periodId);
  }

}
