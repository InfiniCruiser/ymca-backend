import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { PerformanceCalculation } from './entities/performance-calculation.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { AiConfigService } from '../ai-config/ai-config.service';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    @InjectRepository(PerformanceCalculation)
    private performanceCalculationRepository: Repository<PerformanceCalculation>,
    private aiConfigService: AiConfigService,
  ) {}

  async calculateAndSavePerformance(submission: Submission, queryRunner?: QueryRunner): Promise<PerformanceCalculation> {
    // Use the provided query runner or default repository
    const repository = queryRunner ? queryRunner.manager.getRepository(PerformanceCalculation) : this.performanceCalculationRepository;
    
    // Check if performance calculation already exists for this submission
    const existing = await repository.findOne({
      where: { submissionId: submission.id }
    });

    if (existing) {
      console.log(`ℹ️ Performance calculation already exists for submission: ${submission.id}`);
      return existing;
    }

    // Calculate performance metrics based on submission responses
    const performanceData = this.calculatePerformanceFromSubmission(submission);

    // Create and save the performance calculation
    const performanceCalculation = repository.create({
      ...performanceData,
      submissionId: submission.id,
      organizationId: submission.organizationId,
      period: submission.periodId,
      calculatedAt: new Date(),
    });

    const savedCalculation = await repository.save(performanceCalculation);
    
    // Generate AI analysis for the performance calculation
    try {
      await this.generateAIAnalysis(savedCalculation);
    } catch (error) {
      this.logger.error(`Failed to generate AI analysis for performance calculation ${savedCalculation.id}:`, error);
      // Don't fail the performance calculation if AI analysis fails
    }
    
    return savedCalculation;
  }

  async createFromFrontendCalculation(createPerformanceDto: any): Promise<PerformanceCalculation> {
    const { submissionId, organizationId, period, calculatedScores } = createPerformanceDto;
    
    // Check if performance calculation already exists for this submission
    const existing = await this.performanceCalculationRepository.findOne({
      where: { submissionId }
    });

    if (existing) {
      console.log(`ℹ️ Performance calculation already exists for submission: ${submissionId}, updating...`);
      // Update existing calculation
      Object.assign(existing, calculatedScores, {
        calculatedAt: new Date(),
      });
      return await this.performanceCalculationRepository.save(existing);
    }

    // Create new performance calculation from frontend data
    const performanceCalculationData = {
      ...calculatedScores,
      submissionId,
      organizationId,
      period,
      calculatedAt: new Date(),
    };

    const insertResult = await this.performanceCalculationRepository.insert(performanceCalculationData);
    const savedCalculation = await this.performanceCalculationRepository.findOne({
      where: { id: insertResult.identifiers[0].id }
    });
    
    console.log(`✅ Performance calculation saved from frontend: ${savedCalculation.id}`);
    
    return savedCalculation;
  }

  private calculatePerformanceFromSubmission(submission: Submission) {
    const responses = submission.responses || {};
    
    // Initialize scores and values
    let membershipGrowthScore = 0;
    let staffRetentionScore = 0;
    let graceScore = 0;
    let riskMitigationScore = 0;
    let governanceScore = 0;
    let engagementScore = 0;
    
    // Financial metrics
    let monthsOfLiquidityScore = 0;
    let operatingMarginScore = 0;
    let debtRatioScore = 0;
    let operatingRevenueMixScore = 0;
    let charitableRevenueScore = 0;

    // Raw metric values (before scoring)
    let membershipGrowthValue = 0;
    let staffRetentionValue = 0;
    let graceScoreValue = 0;
    let monthsOfLiquidityValue = 0;
    let operatingMarginValue = 0;
    let debtRatioValue = 0;
    let operatingRevenueMixValue = 0;
    let charitableRevenueValue = 0;

    // Helper function to calculate score from Yes/No responses
    const calculateYesNoScore = (questionIds: string[], maxPoints: number): number => {
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
      
      if (totalQuestions === 0) return 0;
      
      // Calculate percentage and convert to points
      const percentage = yesCount / totalQuestions;
      return Math.round(percentage * maxPoints);
    };

    // 1. MEMBERSHIP AND PROGRAM GROWTH (4 points max)
    // Based on Community Engagement questions (EG.CE.001, EG.CE.002, EG.CE.003)
    const communityEngagementQuestions = ['EG.CE.001', 'EG.CE.002', 'EG.CE.003'];
    membershipGrowthScore = calculateYesNoScore(communityEngagementQuestions, 4);
    
    // 2. STAFF RETENTION (4 points max)
    // Based on Staff Engagement questions (EG.SE.001, EG.SE.002, EG.SE.003, EG.SE.004)
    const staffEngagementQuestions = ['EG.SE.001', 'EG.SE.002', 'EG.SE.003', 'EG.SE.004'];
    staffRetentionScore = calculateYesNoScore(staffEngagementQuestions, 4);
    
    // 3. GRACE SCORE (4 points max)
    // Based on Member Engagement questions (EG.ME.001, EG.ME.002, EG.ME.003, EG.ME.004)
    const memberEngagementQuestions = ['EG.ME.001', 'EG.ME.002', 'EG.ME.003', 'EG.ME.004'];
    graceScore = calculateYesNoScore(memberEngagementQuestions, 4);
    
    // 4. RISK MITIGATION (8 points max)
    // Based on Risk Management questions (RM.AQ.001, RM.AQ.002, RM.AQ.003, RM.CP.001, RM.CP.002, RM.CP.003, RM.CP.004, RM.IP.001, RM.IP.002, RM.IP.003, RM.RM.001, RM.RM.002)
    const riskMitigationQuestions = [
      'RM.AQ.001', 'RM.AQ.002', 'RM.AQ.003',
      'RM.CP.001', 'RM.CP.002', 'RM.CP.003', 'RM.CP.004',
      'RM.IP.001', 'RM.IP.002', 'RM.IP.003',
      'RM.RM.001', 'RM.RM.002'
    ];
    riskMitigationScore = calculateYesNoScore(riskMitigationQuestions, 8);
    
    // 5. GOVERNANCE (12 points max)
    // Based on Governance questions (GV.BE.001, GV.BE.002, GV.BE.003, GV.BR.001, GV.BR.002, GV.BR.003, GV.FR.001, GV.FR.002, GV.FR.003, GV.SP.001, GV.SP.002, GV.SP.003)
    const governanceQuestions = [
      'GV.BE.001', 'GV.BE.002', 'GV.BE.003',
      'GV.BR.001', 'GV.BR.002', 'GV.BR.003',
      'GV.FR.001', 'GV.FR.002', 'GV.FR.003',
      'GV.SP.001', 'GV.SP.002', 'GV.SP.003'
    ];
    governanceScore = calculateYesNoScore(governanceQuestions, 12);
    
    // 6. ENGAGEMENT (8 points max)
    // Based on Volunteer Engagement questions (EG.VE.001, EG.VE.002, EG.VE.003)
    const volunteerEngagementQuestions = ['EG.VE.001', 'EG.VE.002', 'EG.VE.003'];
    engagementScore = calculateYesNoScore(volunteerEngagementQuestions, 8);

    // FINANCIAL METRICS (40 points max total)
    // Note: Financial metrics are not currently collected in the survey responses
    // These are set to 0 for now, but the structure is maintained for future financial data collection
    
    // 7. MONTHS OF LIQUIDITY (12 points max) - Not available in current survey
    monthsOfLiquidityScore = 0;
    monthsOfLiquidityValue = 0;

    // 8. OPERATING MARGIN (12 points max) - Not available in current survey
    operatingMarginScore = 0;
    operatingMarginValue = 0;

    // 9. DEBT RATIO (8 points max) - Not available in current survey
    debtRatioScore = 0;
    debtRatioValue = 0;

    // 10. OPERATING REVENUE MIX (4 points max) - Not available in current survey
    operatingRevenueMixScore = 0;
    operatingRevenueMixValue = 0;

    // 11. CHARITABLE REVENUE (4 points max) - Not available in current survey
    charitableRevenueScore = 0;
    charitableRevenueValue = 0;

    // Calculate totals
    const operationalTotalPoints = membershipGrowthScore + staffRetentionScore + graceScore + 
                                 riskMitigationScore + governanceScore + engagementScore;
    const financialTotalPoints = monthsOfLiquidityScore + operatingMarginScore + 
                                debtRatioScore + operatingRevenueMixScore + charitableRevenueScore;
    const totalPoints = operationalTotalPoints + financialTotalPoints;
    
    // Updated max points: Operational (40) + Financial (40) = 80 total
    // But since financial data is not available, we'll use operational max (40) for percentage calculation
    const operationalMaxPoints = 40; // 4+4+4+8+12+8 = 40
    const financialMaxPoints = 40;   // 12+12+8+4+4 = 40
    const totalMaxPoints = operationalMaxPoints + financialMaxPoints; // 80
    
    // Calculate percentage based on operational scores only (since financial data is not available)
    const percentageScore = (operationalTotalPoints / operationalMaxPoints) * 100;

    // Determine performance category and support designation
    let performanceCategory = 'Developing';
    let supportDesignation = 'Independent Improvement';
    let operationalSupportDesignation = 'Independent Improvement';
    let financialSupportDesignation = 'Independent Improvement';

    if (percentageScore >= 75) {
      performanceCategory = 'Exemplary';
      supportDesignation = 'Independent Improvement';
    } else if (percentageScore >= 60) {
      performanceCategory = 'Effective';
      supportDesignation = 'Independent Improvement';
    } else if (percentageScore >= 45) {
      performanceCategory = 'Developing';
      supportDesignation = 'Y-USA Support';
    } else {
      performanceCategory = 'Needs Improvement';
      supportDesignation = 'Y-USA Support';
    }

    // Adjust support designations based on operational vs financial performance
    const operationalPercentage = (operationalTotalPoints / 40) * 100;
    const financialPercentage = (financialTotalPoints / 40) * 100;

    if (operationalPercentage < 60) {
      operationalSupportDesignation = 'Y-USA Support';
    }
    if (financialPercentage < 60) {
      financialSupportDesignation = 'Y-USA Support';
    }

    return {
      // Scores
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
      maxPoints: operationalMaxPoints, // Use operational max points for current calculation
      percentageScore,
      performanceCategory,
      supportDesignation,
      operationalSupportDesignation,
      financialSupportDesignation,
      
      // Raw values
      membershipGrowthValue,
      staffRetentionValue,
      graceScoreValue,
      monthsOfLiquidityValue,
      operatingMarginValue,
      debtRatioValue,
      operatingRevenueMixValue,
      charitableRevenueValue,
      
      // Metadata
      calculationMetadata: {
        calculationVersion: '1.0',
        benchmarkYear: '2024',
        dataSources: ['survey_responses', 'financial_data'],
        lastUpdated: new Date().toISOString()
      }
    };
  }

  // Helper method to get benchmark information
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

  async findAll(): Promise<PerformanceCalculation[]> {
    return this.performanceCalculationRepository.find({
      relations: ['organization'],
      order: { calculatedAt: 'DESC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<PerformanceCalculation[]> {
    return this.performanceCalculationRepository.find({
      where: { organizationId },
      relations: ['organization'],
      order: { calculatedAt: 'DESC' },
    });
  }

  async findLatestByOrganization(organizationId: string): Promise<PerformanceCalculation | null> {
    return this.performanceCalculationRepository.findOne({
      where: { organizationId },
      relations: ['organization'],
      order: { calculatedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PerformanceCalculation | null> {
    return this.performanceCalculationRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async findByPeriod(period: string): Promise<PerformanceCalculation[]> {
    return this.performanceCalculationRepository.find({
      where: { period },
      relations: ['organization'],
      order: { calculatedAt: 'DESC' },
    });
  }

  async getSupportDesignations(): Promise<{ designation: string; count: number }[]> {
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

  async getPerformanceSummary(): Promise<{
    totalOrganizations: number;
    averageScore: number;
    supportDesignations: { designation: string; count: number }[];
    recentCalculations: PerformanceCalculation[];
  }> {
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

  /**
   * Generate AI analysis for a performance calculation
   */
  private async generateAIAnalysis(performanceCalculation: PerformanceCalculation): Promise<void> {
    try {
      this.logger.log(`Generating AI analysis for performance calculation ${performanceCalculation.id}`);
      
      // Build the AI prompt for performance analysis
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

      // Generate AI analysis
      const aiResponse = await this.aiConfigService.generateAnalysis(prompt, context);
      
      this.logger.log(`AI analysis generated successfully for performance calculation ${performanceCalculation.id}`);
      
      // Store the AI analysis in the performance calculation (you might want to add a field for this)
      // For now, we'll just log it
      this.logger.log(`AI Analysis: ${aiResponse.content.substring(0, 200)}...`);
      
    } catch (error) {
      this.logger.error(`Failed to generate AI analysis for performance calculation ${performanceCalculation.id}:`, error);
      throw error;
    }
  }
}
