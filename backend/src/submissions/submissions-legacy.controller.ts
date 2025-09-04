import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService, CreateSubmissionDto, UpdateSubmissionDto } from './submissions.service';
import { Submission } from './entities/submission.entity';

@ApiTags('submissions-legacy')
@Controller('api/submissions')
export class SubmissionsLegacyController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new survey submission (legacy route)' })
  @ApiBody({ type: 'object' })
  @ApiResponse({ status: 201, description: 'Submission created successfully', type: Submission })
  async create(@Body() createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    return this.submissionsService.create(createSubmissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all submissions (legacy route)' })
  @ApiResponse({ status: 200, description: 'List of all submissions', type: [Submission] })
  async findAll(): Promise<Submission[]> {
    return this.submissionsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get submission statistics (legacy route)' })
  @ApiResponse({ status: 200, description: 'Submission statistics' })
  async getStats() {
    return this.submissionsService.getSubmissionStats();
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics for an organization (legacy route)' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID to filter by', required: true })
  @ApiResponse({ status: 200, description: 'Dashboard statistics for the organization' })
  async getDashboardStats(@Query('organizationId') organizationId: string) {
    return this.submissionsService.getDashboardStats(organizationId);
  }

  @Get('period/:periodId')
  @ApiOperation({ summary: 'Get all submissions for a specific period (legacy route)' })
  @ApiResponse({ status: 200, description: 'Submissions for period', type: [Submission] })
  async findByPeriodId(@Param('periodId') periodId: string): Promise<Submission[]> {
    return this.submissionsService.findByPeriodId(periodId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a submission (legacy route)' })
  @ApiBody({ type: 'object' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully', type: Submission })
  async update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    console.log(`🔄 PUT /api/submissions/${id} called with:`, updateSubmissionDto);
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific submission by ID (legacy route)' })
  @ApiResponse({ status: 200, description: 'Submission found', type: Submission })
  async findOne(@Param('id') id: string): Promise<Submission> {
    return this.submissionsService.findOne(id);
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all submissions (for development/testing) (legacy route)' })
  @ApiResponse({ status: 200, description: 'All submissions cleared successfully' })
  async clearAll(): Promise<{ message: string; deletedCount: number }> {
    return this.submissionsService.clearAll();
  }
}
