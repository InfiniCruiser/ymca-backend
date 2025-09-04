"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const performance_service_1 = require("./performance.service");
const ymca_performance_simulation_service_1 = require("./services/ymca-performance-simulation.service");
const performance_calculation_entity_1 = require("./entities/performance-calculation.entity");
let PerformanceController = class PerformanceController {
    constructor(performanceService, simulationService) {
        this.performanceService = performanceService;
        this.simulationService = simulationService;
    }
    async findAll() {
        return this.performanceService.findAll();
    }
    async createFromFrontend(createPerformanceDto) {
        console.log(`🔄 POST /api/v1/performance-calculations called with:`, createPerformanceDto);
        return this.performanceService.createFromFrontendCalculation(createPerformanceDto);
    }
    async getSummary() {
        return this.performanceService.getPerformanceSummary();
    }
    async getSupportDesignations() {
        return this.performanceService.getSupportDesignations();
    }
    async getBenchmarks() {
        return this.performanceService.getBenchmarkInfo();
    }
    async getGraceMetrics(organizationId) {
        const graceMetrics = {
            organizationId,
            graceScore: Math.floor(Math.random() * 19),
            engagementLevel: this.getEngagementLevel(Math.floor(Math.random() * 19)),
            lastUpdated: new Date().toISOString(),
            dataSource: 'Grace Metrics Dashboard (BETA)',
            beta: true,
            note: 'This is a beta endpoint. In production, this will connect to the actual Grace Metrics Dashboard API.'
        };
        return graceMetrics;
    }
    getEngagementLevel(score) {
        if (score >= 14)
            return 'Very Engaged';
        if (score >= 9)
            return 'Engaged with room for improvement';
        if (score >= 4)
            return 'Not very engaged';
        return 'Not at all engaged';
    }
    async findByOrganization(organizationId) {
        return this.performanceService.findByOrganization(organizationId);
    }
    async findLatestByOrganization(organizationId) {
        return this.performanceService.findLatestByOrganization(organizationId);
    }
    async findByPeriod(period) {
        return this.performanceService.findByPeriod(period);
    }
    async findBySubmissionId(submissionId) {
        return this.performanceService.findBySubmissionId(submissionId);
    }
    async findById(id) {
        return this.performanceService.findById(id);
    }
    async generateSimulations() {
        return this.simulationService.generateSimulationsForAllYMCAs();
    }
    async testOrganizations() {
        return this.simulationService.testOrganizationRepository();
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all performance calculations' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all performance calculations',
        type: [performance_calculation_entity_1.PerformanceCalculation]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new performance calculation from frontend-calculated scores' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Performance calculation created successfully',
        type: performance_calculation_entity_1.PerformanceCalculation
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "createFromFrontend", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance summary statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance summary with statistics and recent calculations'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('support-designations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get support designation statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Count of organizations by support designation'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getSupportDesignations", null);
__decorate([
    (0, common_1.Get)('benchmarks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get benchmark information for all metrics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Benchmark information for all OEA metrics'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getBenchmarks", null);
__decorate([
    (0, common_1.Get)('grace-metrics/:organizationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Grace Metrics data for an organization (BETA)' }),
    (0, swagger_1.ApiParam)({ name: 'organizationId', description: 'Organization ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getGraceMetrics", null);
__decorate([
    (0, common_1.Get)('organization/:organizationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance calculations for an organization' }),
    (0, swagger_1.ApiParam)({ name: 'organizationId', description: 'Organization ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance calculations for the organization',
        type: [performance_calculation_entity_1.PerformanceCalculation]
    }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "findByOrganization", null);
__decorate([
    (0, common_1.Get)('organization/:organizationId/latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest performance calculation for an organization' }),
    (0, swagger_1.ApiParam)({ name: 'organizationId', description: 'Organization ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Latest performance calculation for the organization',
        type: performance_calculation_entity_1.PerformanceCalculation
    }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "findLatestByOrganization", null);
__decorate([
    (0, common_1.Get)('period/:period'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance calculations for a specific period' }),
    (0, swagger_1.ApiParam)({ name: 'period', description: 'Period identifier (e.g., Q1-2024)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance calculations for the period',
        type: [performance_calculation_entity_1.PerformanceCalculation]
    }),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "findByPeriod", null);
__decorate([
    (0, common_1.Get)('submission/:submissionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance calculation by submission ID' }),
    (0, swagger_1.ApiParam)({ name: 'submissionId', description: 'Submission ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance calculation for the submission',
        type: performance_calculation_entity_1.PerformanceCalculation
    }),
    __param(0, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "findBySubmissionId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific performance calculation by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Performance calculation ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance calculation details',
        type: performance_calculation_entity_1.PerformanceCalculation
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)('generate-simulations'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate performance simulations for all YMCAs' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Performance simulations generated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                generatedCount: { type: 'number' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "generateSimulations", null);
__decorate([
    (0, common_1.Get)('test-orgs'),
    (0, swagger_1.ApiOperation)({ summary: 'Test organization repository access' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Organization repository test results'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "testOrganizations", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, swagger_1.ApiTags)('performance'),
    (0, common_1.Controller)('performance-calculations'),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService,
        ymca_performance_simulation_service_1.YMCAPerformanceSimulationService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map