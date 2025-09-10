import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService, CreateSubmissionDto, UpdateSubmissionDto, SubmitSubmissionDto } from './submissions.service';
import { Submission } from './entities/submission.entity';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new submission (draft or submitted)' })
  @ApiBody({ type: 'object' })
  @ApiResponse({ status: 201, description: 'Submission created successfully', type: Submission })
  async create(@Body() createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    return this.submissionsService.create(createSubmissionDto);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a draft submission' })
  @ApiBody({ type: 'object' })
  @ApiResponse({ status: 200, description: 'Draft submitted successfully', type: Submission })
  async submitDraft(@Body() submitDto: SubmitSubmissionDto): Promise<Submission> {
    return this.submissionsService.submitDraft(submitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all submissions' })
  @ApiResponse({ status: 200, description: 'List of all submissions', type: [Submission] })
  async findAll(): Promise<Submission[]> {
    return this.submissionsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get submission statistics' })
  @ApiResponse({ status: 200, description: 'Submission statistics' })
  async getStats() {
    return this.submissionsService.getSubmissionStats();
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics for an organization' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID to filter by', required: true })
  @ApiResponse({ status: 200, description: 'Dashboard statistics for the organization' })
  async getDashboardStats(@Query('organizationId') organizationId: string) {
    return this.submissionsService.getDashboardStats(organizationId);
  }

  @Get('period-stats')
  @ApiOperation({ summary: 'Get submission statistics for a specific period' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID to filter by', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID to filter by', required: true })
  @ApiResponse({ status: 200, description: 'Period submission statistics' })
  async getPeriodStats(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string
  ) {
    return this.submissionsService.getPeriodStats(organizationId, periodId);
  }

  @Get('period/:periodId')
  @ApiOperation({ summary: 'Get all submissions for a specific period' })
  @ApiResponse({ status: 200, description: 'Submissions for period', type: [Submission] })
  async findByPeriodId(@Param('periodId') periodId: string): Promise<Submission[]> {
    return this.submissionsService.findByPeriodId(periodId);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest submission for organization and period' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Latest submission found', type: Submission })
  async findLatestSubmission(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string
  ): Promise<Submission | null> {
    return this.submissionsService.findLatestSubmission(organizationId, periodId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get submission history for organization and period' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Submission history', type: [Submission] })
  async findSubmissionHistory(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string
  ): Promise<Submission[]> {
    return this.submissionsService.findSubmissionHistory(organizationId, periodId);
  }

  @Get('draft')
  @ApiOperation({ summary: 'Get current draft submission for organization and period' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID', required: true })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ status: 200, description: 'Draft submission found', type: Submission })
  async findDraftSubmission(
    @Query('organizationId') organizationId: string,
    @Query('periodId') periodId: string
  ): Promise<Submission | null> {
    return this.submissionsService.findDraftSubmission(organizationId, periodId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a submission' })
  @ApiBody({ type: 'object' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully', type: Submission })
  async update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    console.log(`🔄 PUT /api/v1/submissions/${id} called with:`, updateSubmissionDto);
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific submission by ID' })
  @ApiResponse({ status: 200, description: 'Submission found', type: Submission })
  async findOne(@Param('id') id: string): Promise<Submission> {
    return this.submissionsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a draft submission' })
  @ApiResponse({ status: 200, description: 'Draft submission deleted successfully' })
  async deleteDraft(@Param('id') id: string): Promise<{ message: string }> {
    return this.submissionsService.deleteDraft(id);
  }

  @Post('auto-submit/:periodId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auto-submit all draft submissions for a period' })
  @ApiResponse({ status: 200, description: 'Drafts auto-submitted successfully' })
  async autoSubmitDraftsForPeriod(@Param('periodId') periodId: string): Promise<{ submittedCount: number; submissions: Submission[] }> {
    return this.submissionsService.autoSubmitDraftsForPeriod(periodId);
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all submissions (for development/testing)' })
  @ApiResponse({ status: 200, description: 'All submissions cleared successfully' })
  async clearAll(): Promise<{ message: string; deletedCount: number }> {
    return this.submissionsService.clearAll();
  }
}
