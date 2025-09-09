import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PeriodsService } from './periods.service';
import { MarkPeriodCompleteDto, ReopenPeriodDto, PeriodStatusResponseDto, PeriodProgressResponseDto } from './dto/period-completion.dto';

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
}
