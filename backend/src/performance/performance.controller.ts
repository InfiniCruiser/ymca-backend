import { Controller, Get, Param, Query, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { YMCAPerformanceSimulationService } from './services/ymca-performance-simulation.service';
import { PerformanceCalculation } from './entities/performance-calculation.entity';

@ApiTags('performance')
@Controller('performance-calculations')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly simulationService: YMCAPerformanceSimulationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all performance calculations' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all performance calculations',
    type: [PerformanceCalculation]
  })
  async findAll(): Promise<PerformanceCalculation[]> {
    return this.performanceService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new performance calculation from frontend-calculated scores' })
  @ApiBody({
    description: 'Performance calculation data calculated by frontend',
    schema: {
      type: 'object',
      properties: {
        submissionId: { type: 'string', description: 'ID of the submission this calculation is based on' },
        organizationId: { type: 'string', description: 'Organization ID' },
        period: { type: 'string', description: 'Period identifier' },
        calculatedScores: {
          type: 'object',
          description: 'Scores calculated by frontend',
          properties: {
            membershipGrowthScore: { type: 'number' },
            staffRetentionScore: { type: 'number' },
            graceScore: { type: 'number' },
            riskMitigationScore: { type: 'number' },
            governanceScore: { type: 'number' },
            engagementScore: { type: 'number' },
            monthsOfLiquidityScore: { type: 'number' },
            operatingMarginScore: { type: 'number' },
            debtRatioScore: { type: 'number' },
            operatingRevenueMixScore: { type: 'number' },
            charitableRevenueScore: { type: 'number' },
            operationalTotalPoints: { type: 'number' },
            financialTotalPoints: { type: 'number' },
            totalPoints: { type: 'number' },
            maxPoints: { type: 'number' },
            percentageScore: { type: 'number' },
            performanceCategory: { type: 'string' },
            supportDesignation: { type: 'string' },
            operationalSupportDesignation: { type: 'string' },
            financialSupportDesignation: { type: 'string' }
          }
        }
      },
      required: ['submissionId', 'organizationId', 'period', 'calculatedScores']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Performance calculation created successfully',
    type: PerformanceCalculation
  })
  async createFromFrontend(@Body() createPerformanceDto: any): Promise<PerformanceCalculation> {
    console.log(`🔄 POST /api/v1/performance-calculations called with:`, createPerformanceDto);
    return this.performanceService.createFromFrontendCalculation(createPerformanceDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get performance summary statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Performance summary with statistics and recent calculations'
  })
  async getSummary() {
    return this.performanceService.getPerformanceSummary();
  }

  @Get('support-designations')
  @ApiOperation({ summary: 'Get support designation statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Count of organizations by support designation'
  })
  async getSupportDesignations() {
    return this.performanceService.getSupportDesignations();
  }

  @Get('benchmarks')
  @ApiOperation({ summary: 'Get benchmark information for all metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Benchmark information for all OEA metrics'
  })
  async getBenchmarks() {
    return this.performanceService.getBenchmarkInfo();
  }

  @Get('grace-metrics/:organizationId')
  @ApiOperation({ summary: 'Get Grace Metrics data for an organization (BETA)' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Grace Metrics data for the organization',
    schema: {
      type: 'object',
      properties: {
        organizationId: { type: 'string' },
        graceScore: { type: 'number' },
        engagementLevel: { type: 'string' },
        lastUpdated: { type: 'string' },
        dataSource: { type: 'string' },
        beta: { type: 'boolean' }
      }
    }
  })
  async getGraceMetrics(@Param('organizationId') organizationId: string) {
    // BETA: Simulated Grace Metrics integration
    // In production, this would connect to the actual Grace Metrics Dashboard
    const graceMetrics = {
      organizationId,
      graceScore: Math.floor(Math.random() * 19), // 0-18
      engagementLevel: this.getEngagementLevel(Math.floor(Math.random() * 19)),
      lastUpdated: new Date().toISOString(),
      dataSource: 'Grace Metrics Dashboard (BETA)',
      beta: true,
      note: 'This is a beta endpoint. In production, this will connect to the actual Grace Metrics Dashboard API.'
    };

    return graceMetrics;
  }

  private getEngagementLevel(score: number): string {
    if (score >= 14) return 'Very Engaged';
    if (score >= 9) return 'Engaged with room for improvement';
    if (score >= 4) return 'Not very engaged';
    return 'Not at all engaged';
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get performance calculations for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Performance calculations for the organization',
    type: [PerformanceCalculation]
  })
  async findByOrganization(@Param('organizationId') organizationId: string): Promise<PerformanceCalculation[]> {
    return this.performanceService.findByOrganization(organizationId);
  }

  @Get('organization/:organizationId/latest')
  @ApiOperation({ summary: 'Get latest performance calculation for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Latest performance calculation for the organization',
    type: PerformanceCalculation
  })
  async findLatestByOrganization(@Param('organizationId') organizationId: string): Promise<PerformanceCalculation | null> {
    return this.performanceService.findLatestByOrganization(organizationId);
  }

  @Get('period/:period')
  @ApiOperation({ summary: 'Get performance calculations for a specific period' })
  @ApiParam({ name: 'period', description: 'Period identifier (e.g., Q1-2024)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Performance calculations for the period',
    type: [PerformanceCalculation]
  })
  async findByPeriod(@Param('period') period: string): Promise<PerformanceCalculation[]> {
    return this.performanceService.findByPeriod(period);
  }

  @Get('submission/:submissionId')
  @ApiOperation({ summary: 'Get performance calculation by submission ID' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Performance calculation for the submission',
    type: PerformanceCalculation
  })
  async findBySubmissionId(@Param('submissionId') submissionId: string): Promise<PerformanceCalculation | null> {
    return this.performanceService.findBySubmissionId(submissionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific performance calculation by ID' })
  @ApiParam({ name: 'id', description: 'Performance calculation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Performance calculation details',
    type: PerformanceCalculation
  })
  async findById(@Param('id') id: string): Promise<PerformanceCalculation | null> {
    return this.performanceService.findById(id);
  }

  @Post('generate-simulations')
  @ApiOperation({ summary: 'Generate performance simulations for all YMCAs' })
  @ApiResponse({ 
    status: 201, 
    description: 'Performance simulations generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        generatedCount: { type: 'number' }
      }
    }
  })
  async generateSimulations() {
    return this.simulationService.generateSimulationsForAllYMCAs();
  }

  @Get('test-orgs')
  @ApiOperation({ summary: 'Test organization repository access' })
  @ApiResponse({ 
    status: 200, 
    description: 'Organization repository test results'
  })
  async testOrganizations() {
    return this.simulationService.testOrganizationRepository();
  }
}
