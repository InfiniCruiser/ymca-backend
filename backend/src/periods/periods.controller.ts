import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PeriodsService } from './periods.service';
import { MarkPeriodCompleteDto, ReopenPeriodDto, PeriodStatusResponseDto, PeriodProgressResponseDto } from './dto/period-completion.dto';
import { CreatePeriodConfigurationDto, UpdatePeriodConfigurationDto, ActivePeriodResponseDto, PeriodConfigurationResponseDto } from './dto/period-management.dto';

@ApiTags('Periods')
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post('mark-complete')
  @ApiOperation({ summary: 'Mark a period as complete' })
  @ApiResponse({ status: 200, description: 'Period marked as complete successfully', type: PeriodStatusResponseDto })
  @ApiResponse({ status: 404, description: 'Period completion record not found' })
  @ApiResponse({ status: 400, description: 'Invalid request or period cannot be completed' })
  async markPeriodComplete(@Body() dto: MarkPeriodCompleteDto): Promise<PeriodStatusResponseDto> {
    return this.periodsService.markPeriodComplete(dto);
  }

  @Post('reopen')
  @ApiOperation({ summary: 'Reopen a completed period' })
  @ApiResponse({ status: 200, description: 'Period reopened successfully', type: PeriodStatusResponseDto })
  @ApiResponse({ status: 404, description: 'Period completion record not found' })
  @ApiResponse({ status: 400, description: 'Period cannot be reopened (14-day deadline passed)' })
  async reopenPeriod(@Body() dto: ReopenPeriodDto): Promise<PeriodStatusResponseDto> {
    return this.periodsService.reopenPeriod(dto);
  }

  @Get(':periodId/status')
  @ApiOperation({ summary: 'Get period completion status and progress' })
  @ApiResponse({ status: 200, description: 'Period status retrieved successfully', type: PeriodProgressResponseDto })
  @ApiResponse({ status: 404, description: 'Period completion record not found' })
  async getPeriodStatus(
    @Param('periodId') periodId: string,
    @Body() body: { organizationId: string; userId: string }
  ): Promise<PeriodProgressResponseDto> {
    return this.periodsService.getPeriodStatus(body.organizationId, periodId, body.userId);
  }

  // ============================================================================
  // PERIOD CONFIGURATION MANAGEMENT ENDPOINTS
  // ============================================================================

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active period' })
  @ApiResponse({ status: 200, description: 'Active period retrieved successfully', type: ActivePeriodResponseDto })
  @ApiResponse({ status: 404, description: 'No active period found' })
  async getActivePeriod(): Promise<ActivePeriodResponseDto> {
    return this.periodsService.getActivePeriod();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available periods for selection' })
  @ApiResponse({ status: 200, description: 'Available periods retrieved successfully' })
  async getAvailablePeriods() {
    return this.periodsService.getAvailablePeriods();
  }

  @Get('configurations')
  @ApiOperation({ summary: 'Get all period configurations' })
  @ApiResponse({ status: 200, description: 'Period configurations retrieved successfully', type: [PeriodConfigurationResponseDto] })
  async getAllPeriodConfigurations(): Promise<PeriodConfigurationResponseDto[]> {
    return this.periodsService.getAllPeriodConfigurations();
  }

  @Get('configurations/:periodId')
  @ApiOperation({ summary: 'Get period configuration by period ID' })
  @ApiResponse({ status: 200, description: 'Period configuration retrieved successfully', type: PeriodConfigurationResponseDto })
  @ApiResponse({ status: 404, description: 'Period configuration not found' })
  async getPeriodConfiguration(@Param('periodId') periodId: string): Promise<PeriodConfigurationResponseDto> {
    return this.periodsService.getPeriodConfiguration(periodId);
  }

  @Post('configurations')
  @ApiOperation({ summary: 'Create a new period configuration' })
  @ApiResponse({ status: 201, description: 'Period configuration created successfully', type: PeriodConfigurationResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createPeriodConfiguration(@Body() dto: CreatePeriodConfigurationDto): Promise<PeriodConfigurationResponseDto> {
    return this.periodsService.createPeriodConfiguration(dto);
  }

  @Put('configurations/:id')
  @ApiOperation({ summary: 'Update a period configuration' })
  @ApiResponse({ status: 200, description: 'Period configuration updated successfully', type: PeriodConfigurationResponseDto })
  @ApiResponse({ status: 404, description: 'Period configuration not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async updatePeriodConfiguration(
    @Param('id') id: string,
    @Body() dto: UpdatePeriodConfigurationDto
  ): Promise<PeriodConfigurationResponseDto> {
    return this.periodsService.updatePeriodConfiguration(id, dto);
  }

  @Post('fix-active-periods')
  @ApiOperation({ summary: 'Fix active periods - ensure only one period is active' })
  @ApiResponse({ status: 200, description: 'Active periods fixed successfully' })
  async fixActivePeriods(): Promise<{ message: string }> {
    await this.periodsService.fixActivePeriods();
    return { message: 'Active periods fixed successfully' };
  }
}
