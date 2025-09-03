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
var YMCAPerformanceSimulationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YMCAPerformanceSimulationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const performance_calculation_entity_1 = require("../entities/performance-calculation.entity");
let YMCAPerformanceSimulationService = YMCAPerformanceSimulationService_1 = class YMCAPerformanceSimulationService {
    constructor(organizationRepository, performanceRepository) {
        this.organizationRepository = organizationRepository;
        this.performanceRepository = performanceRepository;
        this.logger = new common_1.Logger(YMCAPerformanceSimulationService_1.name);
    }
    async generateSimulationsForAllYMCAs() {
        try {
            this.logger.log('🚀 Starting YMCA performance simulation generation...');
            this.logger.log('🔍 Checking organization repository...');
            const totalOrgs = await this.organizationRepository.count();
            this.logger.log(`📊 Total organizations in database: ${totalOrgs}`);
            this.logger.log('🔍 Querying for YMCA organizations...');
            const organizations = await this.organizationRepository.find({
                where: { type: organization_entity_1.OrganizationType.LOCAL_Y }
            });
            this.logger.log(`🏢 Found ${organizations.length} YMCA organizations`);
            if (organizations.length === 0) {
                this.logger.warn('No YMCA organizations found');
                return { message: 'No YMCA organizations found', generatedCount: 0 };
            }
            this.logger.log(`📊 Found ${organizations.length} YMCA organizations to simulate`);
            let generatedCount = 0;
            const errors = [];
            for (const organization of organizations) {
                try {
                    const simulation = this.generateRealisticPerformance(organization);
                    await this.performanceRepository.save(simulation);
                    generatedCount++;
                    if (generatedCount % 10 === 0) {
                        this.logger.log(`✅ Generated ${generatedCount}/${organizations.length} simulations`);
                    }
                }
                catch (error) {
                    const errorMsg = `Failed to generate simulation for ${organization.name}: ${error.message}`;
                    this.logger.error(errorMsg);
                    errors.push(errorMsg);
                }
            }
            this.logger.log(`🎉 Successfully generated ${generatedCount} performance simulations`);
            if (errors.length > 0) {
                this.logger.warn(`⚠️ ${errors.length} errors occurred during generation`);
            }
            return {
                message: `Successfully generated ${generatedCount} performance simulations`,
                generatedCount
            };
        }
        catch (error) {
            this.logger.error('❌ Error generating simulations:', error);
            throw error;
        }
    }
    async testOrganizationRepository() {
        try {
            this.logger.log('🧪 Testing organization repository...');
            const totalOrgs = await this.organizationRepository.count();
            this.logger.log(`📊 Total organizations: ${totalOrgs}`);
            const ymcaOrgs = await this.organizationRepository.find({
                where: { type: organization_entity_1.OrganizationType.LOCAL_Y }
            });
            this.logger.log(`🏢 YMCA organizations: ${ymcaOrgs.length}`);
            return {
                message: 'Organization repository test completed',
                totalCount: totalOrgs,
                ymcaCount: ymcaOrgs.length
            };
        }
        catch (error) {
            this.logger.error('❌ Error testing organization repository:', error);
            throw error;
        }
    }
    generateRealisticPerformance(organization) {
        const simulation = new performance_calculation_entity_1.PerformanceCalculation();
        simulation.organizationId = organization.id;
        simulation.period = 'simulation-period-2024';
        simulation.calculatedAt = new Date();
        const scores = this.generateScoresBasedOnCharacteristics(organization);
        simulation.membershipGrowthScore = scores.membershipGrowth;
        simulation.staffRetentionScore = scores.staffRetention;
        simulation.graceScore = scores.graceScore;
        simulation.riskMitigationScore = scores.riskMitigation;
        simulation.governanceScore = scores.governance;
        simulation.engagementScore = scores.engagement;
        simulation.monthsOfLiquidityScore = scores.monthsLiquidity;
        simulation.operatingMarginScore = scores.operatingMargin;
        simulation.debtRatioScore = scores.debtRatio;
        simulation.operatingRevenueMixScore = scores.revenueMix;
        simulation.charitableRevenueScore = scores.revenueMix;
        simulation.operationalTotalPoints = scores.operationalTotal;
        simulation.financialTotalPoints = scores.financialTotal;
        simulation.totalPoints = scores.operationalTotal + scores.financialTotal;
        simulation.maxPoints = 80;
        simulation.percentageScore = Math.round((simulation.totalPoints / simulation.maxPoints) * 100);
        simulation.supportDesignation = this.determineSupportDesignation(simulation.totalPoints);
        return simulation;
    }
    generateScoresBasedOnCharacteristics(organization) {
        const baseScores = {
            membershipGrowth: this.randomScore(0, 4, 2),
            staffRetention: this.randomScore(0, 4, 2),
            graceScore: this.randomScore(0, 4, 2),
            riskMitigation: this.randomScore(0, 8, 4),
            governance: this.randomScore(0, 12, 6),
            engagement: this.randomScore(0, 8, 4),
            monthsLiquidity: this.randomScore(0, 12, 6),
            operatingMargin: this.randomScore(0, 12, 6),
            debtRatio: this.randomScore(0, 8, 4),
            revenueMix: this.randomScore(0, 4, 2),
        };
        this.adjustScoresBasedOnCharacteristics(baseScores, organization);
        const operationalTotal = baseScores.membershipGrowth + baseScores.staffRetention +
            baseScores.graceScore + baseScores.riskMitigation +
            baseScores.governance + baseScores.engagement;
        const financialTotal = baseScores.monthsLiquidity + baseScores.operatingMargin +
            baseScores.debtRatio + baseScores.revenueMix;
        return {
            ...baseScores,
            operationalTotal,
            financialTotal
        };
    }
    adjustScoresBasedOnCharacteristics(scores, organization) {
        if (organization.budgetRange) {
            if (organization.budgetRange.includes('$1,000,000')) {
                scores.monthsLiquidity = Math.min(12, scores.monthsLiquidity + 2);
                scores.operatingMargin = Math.min(12, scores.operatingMargin + 2);
                scores.governance = Math.min(12, scores.governance + 2);
            }
            else if (organization.budgetRange.includes('$250,000')) {
                scores.monthsLiquidity = Math.max(0, scores.monthsLiquidity - 1);
                scores.operatingMargin = Math.max(0, scores.operatingMargin - 1);
            }
        }
        if (organization.memberGroup) {
            if (organization.memberGroup.includes('Large')) {
                scores.membershipGrowth = Math.min(4, scores.membershipGrowth + 1);
                scores.engagement = Math.min(8, scores.engagement + 1);
            }
            else if (organization.memberGroup.includes('Small')) {
                scores.graceScore = Math.min(4, scores.graceScore + 1);
                scores.staffRetention = Math.min(4, scores.staffRetention + 1);
            }
        }
        if (organization.facilityType === 'Facility') {
            scores.programRevenue = Math.min(4, scores.programRevenue + 1);
            scores.engagement = Math.min(8, scores.engagement + 1);
        }
    }
    randomScore(min, max, preferredValue) {
        const random = Math.random();
        if (random < 0.4) {
            return Math.max(min, Math.min(max, preferredValue + Math.floor(Math.random() * 3) - 1));
        }
        else if (random < 0.7) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else {
            return Math.floor(Math.random() * (preferredValue - min + 1)) + min;
        }
    }
    determineSupportDesignation(totalScore) {
        if (totalScore >= 60) {
            return 'Y-USA Support';
        }
        else if (totalScore >= 40) {
            return 'Independent Improvement';
        }
        else {
            return 'Intensive Support';
        }
    }
};
exports.YMCAPerformanceSimulationService = YMCAPerformanceSimulationService;
exports.YMCAPerformanceSimulationService = YMCAPerformanceSimulationService = YMCAPerformanceSimulationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(performance_calculation_entity_1.PerformanceCalculation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], YMCAPerformanceSimulationService);
//# sourceMappingURL=ymca-performance-simulation.service.js.map