import { Controller, Get, Put, Post, Body, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DraftService, GetActiveDraftDto, UpsertDraftDto, StartFreshDraftDto, SubmitDraftDto } from './draft.service';
import { Submission } from './entities/submission.entity';

@ApiTags('drafts')
@Controller('drafts')
@UseGuards() // Add auth guard when available
@ApiBearerAuth()
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get the current active draft for the authenticated user' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Active draft retrieved successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No active draft found' })
  async getCurrentDraft(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
    @Request() req: any
  ): Promise<Submission | null> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.sub || 'temp-user-id'; // Temporary for testing
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    return this.draftService.getActiveDraft(organizationId, userId, periodId);
  }

  @Put('current')
  @ApiOperation({ summary: 'Upsert the current active draft (update existing or create new)' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Draft upserted successfully', type: Submission })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async upsertCurrentDraft(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
    @Body() body: { responses: Record<string, any> },
    @Request() req: any
  ): Promise<Submission> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.sub || 'temp-user-id'; // Temporary for testing
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    if (!body.responses) {
      throw new Error('responses are required');
    }

    return this.draftService.upsertActiveDraft(organizationId, userId, periodId, {
      responses: body.responses
    });
  }


  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit the current active draft' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Draft submitted successfully', type: Submission })
  @ApiResponse({ status: 404, description: 'No active draft found' })
  async submitDraft(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string,
    @Request() req: any
  ): Promise<Submission> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.sub || 'temp-user-id'; // Temporary for testing
    
    if (!organizationId || !periodId) {
      throw new Error('organizationId and periodId are required');
    }

    return this.draftService.submitDraft(organizationId, userId, periodId);
  }
}
