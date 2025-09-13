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

@ApiTags('ceo-approval')
@Controller('ceo-approval')
@UseGuards() // Add auth guard when available
@ApiBearerAuth()
export class CeoApprovalController {
  constructor(private readonly ceoApprovalService: CeoApprovalService) {}

  @Get('work')
  @ApiOperation({ summary: 'Get current work entity (draft, submission, or empty)' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Work entity retrieved successfully' })
  async getWork(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
    @Request() req: any
  ): Promise<WorkResult> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.sub || 'temp-user-id';
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    return this.ceoApprovalService.getWork(organizationId, periodId);
  }

  @Post('submit-for-approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit draft for CEO approval' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Draft submitted for approval successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No active draft found' })
  async submitForApproval(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
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

  @Post('approve-submission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'CEO approve submission (OPEN → LOCKED)' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Submission approved successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No submission found' })
  async approveSubmission(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
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
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Submission reopened successfully', type: Draft })
  @ApiResponse({ status: 404, description: 'No submission found' })
  async reopenSubmission(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
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

  @Put('submission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit submission (only while OPEN)' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Submission updated successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No submission found' })
  @ApiResponse({ status: 423, description: 'Submission is locked' })
  async editSubmission(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
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

  @Post('start-fresh')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start fresh draft (pre-submit only)' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 201, description: 'Fresh draft created successfully', type: Draft })
  @ApiResponse({ status: 409, description: 'Submission already exists' })
  async startFresh(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
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
