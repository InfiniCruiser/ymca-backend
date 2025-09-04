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
var PerformanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const performance_calculation_entity_1 = require("./entities/performance-calculation.entity");
const ai_config_service_1 = require("../ai-config/ai-config.service");
let PerformanceService = PerformanceService_1 = class PerformanceService {
    constructor(performanceCalculationRepository, aiConfigService) {
        this.performanceCalculationRepository = performanceCalculationRepository;
        this.aiConfigService = aiConfigService;
        this.logger = new common_1.Logger(PerformanceService_1.name);
    }
    async calculateAndSavePerformance(submission, queryRunner) {
        const repository = queryRunner ? queryRunner.manager.getRepository(performance_calculation_entity_1.PerformanceCalculation) : this.performanceCalculationRepository;
        const existing = await repository.findOne({
            where: { submissionId: submission.id }
        });
        if (existing) {
            console.log(`ℹ️ Performance calculation already exists for submission: ${submission.id}`);
            return existing;
        }
        const performanceData = this.calculatePerformanceFromSubmission(submission);
        const performanceCalculation = repository.create({
            ...performanceData,
            submissionId: submission.id,
            organizationId: submission.organizationId,
            period: submission.periodId,
            calculatedAt: new Date(),
        });
        const savedCalculation = await repository.save(performanceCalculation);
        try {
            await this.generateAIAnalysis(savedCalculation);
        }
        catch (error) {
            this.logger.error(`Failed to generate AI analysis for performance calculation ${savedCalculation.id}:`, error);
        }
        return savedCalculation;
    }
    calculatePerformanceFromSubmission(submission) {
        const responses = submission.responses || {};
        let membershipGrowthScore = 0;
        let staffRetentionScore = 0;
        let graceScore = 0;
        let riskMitigationScore = 0;
        let governanceScore = 0;
        let engagementScore = 0;
        let monthsOfLiquidityScore = 0;
        let operatingMarginScore = 0;
        let debtRatioScore = 0;
        let operatingRevenueMixScore = 0;
        let charitableRevenueScore = 0;
        let membershipGrowthValue = 0;
        let staffRetentionValue = 0;
        let graceScoreValue = 0;
        let monthsOfLiquidityValue = 0;
        let operatingMarginValue = 0;
        let debtRatioValue = 0;
        let operatingRevenueMixValue = 0;
        let charitableRevenueValue = 0;
        const calculateYesNoScore = (questionIds, maxPoints) => {
            let yesCount = 0;
            let totalQuestions = 0;
            questionIds.forEach(questionId => {
                if (responses[questionId] !== undefined) {
                    totalQuestions++;
                    if (responses[questionId] === 'Yes') {
                        yesCount++;
                    }
                }
            });
            if (totalQuestions === 0)
                return 0;
            const percentage = yesCount / totalQuestions;
            return Math.round(percentage * maxPoints);
        };
        const communityEngagementQuestions = ['EG.CE.001', 'EG.CE.002', 'EG.CE.003'];
        membershipGrowthScore = calculateYesNoScore(communityEngagementQuestions, 4);
        const staffEngagementQuestions = ['EG.SE.001', 'EG.SE.002', 'EG.SE.003', 'EG.SE.004'];
        staffRetentionScore = calculateYesNoScore(staffEngagementQuestions, 4);
        const memberEngagementQuestions = ['EG.ME.001', 'EG.ME.002', 'EG.ME.003', 'EG.ME.004'];
        graceScore = calculateYesNoScore(memberEngagementQuestions, 4);
        const riskMitigationQuestions = [
            'RM.AQ.001', 'RM.AQ.002', 'RM.AQ.003',
            'RM.CP.001', 'RM.CP.002', 'RM.CP.003', 'RM.CP.004',
            'RM.IP.001', 'RM.IP.002', 'RM.IP.003',
            'RM.RM.001', 'RM.RM.002'
        ];
        riskMitigationScore = calculateYesNoScore(riskMitigationQuestions, 8);
        const governanceQuestions = [
            'GV.BE.001', 'GV.BE.002', 'GV.BE.003',
            'GV.BR.001', 'GV.BR.002', 'GV.BR.003',
            'GV.FR.001', 'GV.FR.002', 'GV.FR.003',
            'GV.SP.001', 'GV.SP.002', 'GV.SP.003'
        ];
        governanceScore = calculateYesNoScore(governanceQuestions, 12);
        const volunteerEngagementQuestions = ['EG.VE.001', 'EG.VE.002', 'EG.VE.003'];
        engagementScore = calculateYesNoScore(volunteerEngagementQuestions, 8);
        monthsOfLiquidityScore = 0;
        monthsOfLiquidityValue = 0;
        operatingMarginScore = 0;
        operatingMarginValue = 0;
        debtRatioScore = 0;
        debtRatioValue = 0;
        operatingRevenueMixScore = 0;
        operatingRevenueMixValue = 0;
        charitableRevenueScore = 0;
        charitableRevenueValue = 0;
        const operationalTotalPoints = membershipGrowthScore + staffRetentionScore + graceScore +
            riskMitigationScore + governanceScore + engagementScore;
        const financialTotalPoints = monthsOfLiquidityScore + operatingMarginScore +
            debtRatioScore + operatingRevenueMixScore + charitableRevenueScore;
        const totalPoints = operationalTotalPoints + financialTotalPoints;
        const operationalMaxPoints = 40;
        const financialMaxPoints = 40;
        const totalMaxPoints = operationalMaxPoints + financialMaxPoints;
        const percentageScore = (operationalTotalPoints / operationalMaxPoints) * 100;
        let performanceCategory = 'Developing';
        let supportDesignation = 'Independent Improvement';
        let operationalSupportDesignation = 'Independent Improvement';
        let financialSupportDesignation = 'Independent Improvement';
        if (percentageScore >= 75) {
            performanceCategory = 'Exemplary';
            supportDesignation = 'Independent Improvement';
        }
        else if (percentageScore >= 60) {
            performanceCategory = 'Effective';
            supportDesignation = 'Independent Improvement';
        }
        else if (percentageScore >= 45) {
            performanceCategory = 'Developing';
            supportDesignation = 'Y-USA Support';
        }
        else {
            performanceCategory = 'Needs Improvement';
            supportDesignation = 'Y-USA Support';
        }
        const operationalPercentage = (operationalTotalPoints / 40) * 100;
        const financialPercentage = (financialTotalPoints / 40) * 100;
        if (operationalPercentage < 60) {
            operationalSupportDesignation = 'Y-USA Support';
        }
        if (financialPercentage < 60) {
            financialSupportDesignation = 'Y-USA Support';
        }
        return {
            membershipGrowthScore,
            staffRetentionScore,
            graceScore,
            riskMitigationScore,
            governanceScore,
            engagementScore,
            monthsOfLiquidityScore,
            operatingMarginScore,
            debtRatioScore,
            operatingRevenueMixScore,
            charitableRevenueScore,
            operationalTotalPoints,
            financialTotalPoints,
            totalPoints,
            maxPoints: operationalMaxPoints,
            percentageScore,
            performanceCategory,
            supportDesignation,
            operationalSupportDesignation,
            financialSupportDesignation,
            membershipGrowthValue,
            staffRetentionValue,
            graceScoreValue,
            monthsOfLiquidityValue,
            operatingMarginValue,
            debtRatioValue,
            operatingRevenueMixValue,
            charitableRevenueValue,
            calculationMetadata: {
                calculationVersion: '1.0',
                benchmarkYear: '2024',
                dataSources: ['survey_responses', 'financial_data'],
                lastUpdated: new Date().toISOString()
            }
        };
    }
    getBenchmarkInfo() {
        return {
            membershipGrowth: {
                formula: "(Current Members – Prior Year Members) ÷ Prior Year Members – Demographic Growth",
                benchmarks: [
                    { range: "Bottom third (0-33%)", score: 0 },
                    { range: "Middle third (34-66%)", score: 2 },
                    { range: "Top third (67-100%)", score: 4 }
                ]
            },
            staffRetention: {
                formula: "(FTE Beginning - FTE Left) ÷ FTE Beginning",
                benchmarks: [
                    { range: ">20% turnover", score: 0 },
                    { range: "10-20% turnover", score: 2 },
                    { range: "<10% turnover", score: 4 }
                ]
            },
            graceScore: {
                formula: "Grace Metrics Dashboard Score",
                benchmarks: [
                    { range: "Not at all engaged (0-3)", score: 0 },
                    { range: "Not very engaged (4-8)", score: 2 },
                    { range: "Engaged with room for improvement (9-13)", score: 2 },
                    { range: "Very engaged (14-18)", score: 4 }
                ]
            },
            monthsOfLiquidity: {
                formula: "(Cash + Short Term Investments) ÷ (Total Expenses ÷ 12)",
                benchmarks: [
                    { range: "<1.5 months", score: 0 },
                    { range: "1.5-3 months", score: 6 },
                    { range: ">3 months", score: 12 }
                ]
            },
            operatingMargin: {
                formula: "(Operating Revenue – Operating Expenses) ÷ Operating Revenue",
                benchmarks: [
                    { range: "<2.7%", score: 0 },
                    { range: "2.7-3.0%", score: 6 },
                    { range: ">3%", score: 12 }
                ]
            },
            debtRatio: {
                formula: "Total Debt ÷ Unrestricted Net Assets",
                benchmarks: [
                    { range: "<22.5%", score: 0 },
                    { range: "22.5-27%", score: 4 },
                    { range: ">27%", score: 8 }
                ]
            },
            operatingRevenueMix: {
                formula: "|(Program Revenue / Total Operating Revenue) - (Membership Revenue / Total Operating Revenue)|",
                benchmarks: [
                    { range: ">40%", score: 0 },
                    { range: "20-40%", score: 2 },
                    { range: "<20%", score: 4 }
                ]
            },
            charitableRevenue: {
                formula: "Charitable Revenue ÷ Operating Revenue",
                benchmarks: [
                    { range: "<9.8%", score: 0 },
                    { range: "9.8-15%", score: 2 },
                    { range: ">15%", score: 4 }
                ]
            }
        };
    }
    async findAll() {
        return this.performanceCalculationRepository.find({
            relations: ['organization'],
            order: { calculatedAt: 'DESC' },
        });
    }
    async findByOrganization(organizationId) {
        return this.performanceCalculationRepository.find({
            where: { organizationId },
            relations: ['organization'],
            order: { calculatedAt: 'DESC' },
        });
    }
    async findLatestByOrganization(organizationId) {
        return this.performanceCalculationRepository.findOne({
            where: { organizationId },
            relations: ['organization'],
            order: { calculatedAt: 'DESC' },
        });
    }
    async findById(id) {
        return this.performanceCalculationRepository.findOne({
            where: { id },
            relations: ['organization'],
        });
    }
    async findByPeriod(period) {
        return this.performanceCalculationRepository.find({
            where: { period },
            relations: ['organization'],
            order: { calculatedAt: 'DESC' },
        });
    }
    async getSupportDesignations() {
        const results = await this.performanceCalculationRepository
            .createQueryBuilder('pc')
            .select('pc.supportDesignation', 'designation')
            .addSelect('COUNT(*)', 'count')
            .where('pc.supportDesignation IS NOT NULL')
            .groupBy('pc.supportDesignation')
            .getRawMany();
        return results.map(result => ({
            designation: result.designation,
            count: parseInt(result.count),
        }));
    }
    async getPerformanceSummary() {
        const [totalOrganizations, averageScore, supportDesignations, recentCalculations] = await Promise.all([
            this.performanceCalculationRepository
                .createQueryBuilder('pc')
                .select('COUNT(DISTINCT pc.organizationId)', 'count')
                .getRawOne()
                .then(result => parseInt(result.count)),
            this.performanceCalculationRepository
                .createQueryBuilder('pc')
                .select('AVG(pc.totalScore)', 'average')
                .getRawOne()
                .then(result => parseFloat(result.average) || 0),
            this.getSupportDesignations(),
            this.performanceCalculationRepository.find({
                relations: ['organization'],
                order: { calculatedAt: 'DESC' },
                take: 10,
            }),
        ]);
        return {
            totalOrganizations,
            averageScore: Math.round(averageScore * 100) / 100,
            supportDesignations,
            recentCalculations,
        };
    }
    async generateAIAnalysis(performanceCalculation) {
        try {
            this.logger.log(`Generating AI analysis for performance calculation ${performanceCalculation.id}`);
            const prompt = {
                system: `You are an expert YMCA performance analyst. Analyze the performance data and provide actionable insights and recommendations for improvement. Focus on:
1. Key strengths and areas of excellence
2. Critical areas needing improvement
3. Specific, actionable recommendations
4. Industry best practices and benchmarks
5. Risk factors and mitigation strategies

Provide a structured analysis with clear sections and bullet points.`,
                user: `Analyze this YMCA performance data:

Organization ID: ${performanceCalculation.organizationId}
Period: ${performanceCalculation.period}
Total Score: ${performanceCalculation.totalPoints}/${performanceCalculation.maxPoints} (${performanceCalculation.percentageScore}%)

Operational Metrics:
- Membership Growth: ${performanceCalculation.membershipGrowthScore}/4
- Staff Retention: ${performanceCalculation.staffRetentionScore}/4
- Grace Score: ${performanceCalculation.graceScore}/4
- Risk Mitigation: ${performanceCalculation.riskMitigationScore}/4
- Governance: ${performanceCalculation.governanceScore}/4
- Engagement: ${performanceCalculation.engagementScore}/4

Financial Metrics:
- Months of Liquidity: ${performanceCalculation.monthsOfLiquidityScore}/4
- Operating Margin: ${performanceCalculation.operatingMarginScore}/4
- Debt Ratio: ${performanceCalculation.debtRatioScore}/4
- Operating Revenue Mix: ${performanceCalculation.operatingRevenueMixScore}/4
- Charitable Revenue: ${performanceCalculation.charitableRevenueScore}/4

Support Designation: ${performanceCalculation.supportDesignation || 'Not specified'}

Please provide a comprehensive analysis and recommendations.`
            };
            const context = {
                ymcaId: performanceCalculation.organizationId,
                period: performanceCalculation.period,
                totalScore: performanceCalculation.totalPoints,
                maxScore: performanceCalculation.maxPoints,
                percentageScore: performanceCalculation.percentageScore
            };
            const aiResponse = await this.aiConfigService.generateAnalysis(prompt, context);
            this.logger.log(`AI analysis generated successfully for performance calculation ${performanceCalculation.id}`);
            this.logger.log(`AI Analysis: ${aiResponse.content.substring(0, 200)}...`);
        }
        catch (error) {
            this.logger.error(`Failed to generate AI analysis for performance calculation ${performanceCalculation.id}:`, error);
            throw error;
        }
    }
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = PerformanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(performance_calculation_entity_1.PerformanceCalculation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ai_config_service_1.AiConfigService])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map