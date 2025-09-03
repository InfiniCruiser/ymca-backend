import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService, CreateSubmissionDto, UpdateSubmissionDto } from './submissions.service';
import { Submission } from './entities/submission.entity';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new survey submission' })
  @ApiBody({ type: 'object' })
  @ApiResponse({ status: 201, description: 'Submission created successfully', type: Submission })
  async create(@Body() createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    return this.submissionsService.create(createSubmissionDto);
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific submission by ID' })
  @ApiResponse({ status: 200, description: 'Submission found', type: Submission })
  async findOne(@Param('id') id: string): Promise<Submission> {
    return this.submissionsService.findOne(id);
  }

  @Get('period/:periodId')
  @ApiOperation({ summary: 'Get all submissions for a specific period' })
  @ApiResponse({ status: 200, description: 'Submissions for period', type: [Submission] })
  async findByPeriodId(@Param('periodId') periodId: string): Promise<Submission[]> {
    return this.submissionsService.findByPeriodId(periodId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a submission' })
  @ApiBody({ type: 'object' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully', type: Submission })
  async update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all submissions (for development/testing)' })
  @ApiResponse({ status: 200, description: 'All submissions cleared successfully' })
  async clearAll(): Promise<{ message: string; deletedCount: number }> {
    return this.submissionsService.clearAll();
  }
}
