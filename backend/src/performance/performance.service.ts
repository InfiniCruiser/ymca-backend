import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async calculateAndSavePerformance(submission: Submission): Promise<PerformanceCalculation> {
    // Check if performance calculation already exists for this submission
    const existing = await this.performanceCalculationRepository.findOne({
      where: { submissionId: submission.id }
    });

    if (existing) {
      console.log(`ℹ️ Performance calculation already exists for submission: ${submission.id}`);
      return existing;
    }

    // Calculate performance metrics based on submission responses
    const performanceData = this.calculatePerformanceFromSubmission(submission);

    // Create and save the performance calculation
    const performanceCalculation = this.performanceCalculationRepository.create({
      ...performanceData,
      submissionId: submission.id,
      organizationId: submission.organizationId,
      period: submission.periodId,
      calculatedAt: new Date(),
    });

    const savedCalculation = await this.performanceCalculationRepository.save(performanceCalculation);
    
    // Generate AI analysis for the performance calculation
    try {
      await this.generateAIAnalysis(savedCalculation);
    } catch (error) {
      this.logger.error(`Failed to generate AI analysis for performance calculation ${savedCalculation.id}:`, error);
      // Don't fail the performance calculation if AI analysis fails
    }
    
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

    // 1. MEMBERSHIP AND PROGRAM GROWTH (4 points max)
    // Formula: (Current Members – Prior Year Members) ÷ Prior Year Members – Demographic Growth
    if (responses.current_members && responses.prior_year_members && responses.demographic_growth) {
      const currentMembers = parseFloat(responses.current_members);
      const priorYearMembers = parseFloat(responses.prior_year_members);
      const demographicGrowth = parseFloat(responses.demographic_growth);
      
      membershipGrowthValue = ((currentMembers - priorYearMembers) / priorYearMembers) - demographicGrowth;
      
      // Benchmarks: Bottom third (0-33%): 0, Middle third (34-66%): 2, Top third (67-100%): 4
      if (membershipGrowthValue >= 0.67) {
        membershipGrowthScore = 4;
      } else if (membershipGrowthValue >= 0.34) {
        membershipGrowthScore = 2;
      } else {
        membershipGrowthScore = 0;
      }
    }
    
    // 2. STAFF RETENTION (4 points max)
    // Formula: (FTE Beginning - FTE Left) ÷ FTE Beginning
    if (responses.ft_beginning && responses.ft_left) {
      const ftBeginning = parseFloat(responses.ft_beginning);
      const ftLeft = parseFloat(responses.ft_left);
      
      staffRetentionValue = (ftBeginning - ftLeft) / ftBeginning;
      
      // Benchmarks: >20% turnover: 0, 10-20%: 2, <10%: 4
      const turnoverRate = 1 - staffRetentionValue;
      if (turnoverRate < 0.10) {
        staffRetentionScore = 4;
      } else if (turnoverRate <= 0.20) {
        staffRetentionScore = 2;
      } else {
        staffRetentionScore = 0;
      }
    }
    
    // 3. GRACE SCORE (4 points max)
    // Based on Grace Metrics Dashboard
    if (responses.grace_metrics_score) {
      graceScoreValue = parseFloat(responses.grace_metrics_score);
      
      // Benchmarks: Very Engaged (14-18): 4, Engaged with room for improvement (9-13): 2, Not very engaged (4-8): 2, Not at all engaged (0-3): 0
      if (graceScoreValue >= 14) {
        graceScore = 4;
      } else if (graceScoreValue >= 9) {
        graceScore = 2;
      } else if (graceScoreValue >= 4) {
        graceScore = 2;
      } else {
        graceScore = 0;
      }
    }
    
    // 4. RISK MITIGATION (8 points max) - Simplified for now
    if (responses.risk_mitigation) {
      riskMitigationScore = Math.min(8, parseFloat(responses.risk_mitigation) || 0);
    }
    
    // 5. GOVERNANCE (12 points max) - Simplified for now
    if (responses.governance) {
      governanceScore = Math.min(12, parseFloat(responses.governance) || 0);
    }
    
    // 6. ENGAGEMENT (8 points max) - Simplified for now
    if (responses.engagement) {
      engagementScore = Math.min(8, parseFloat(responses.engagement) || 0);
    }

    // FINANCIAL METRICS (40 points max total)

    // 7. MONTHS OF LIQUIDITY (12 points max)
    // Formula: (Cash and Cash Equivalents + Short Term Investments) ÷ (Total Expenses ÷ 12)
    if (responses.cash_equivalents && responses.short_term_investments && responses.total_expenses) {
      const cashEquivalents = parseFloat(responses.cash_equivalents);
      const shortTermInvestments = parseFloat(responses.short_term_investments);
      const totalExpenses = parseFloat(responses.total_expenses);
      
      monthsOfLiquidityValue = (cashEquivalents + shortTermInvestments) / (totalExpenses / 12);
      
      // Benchmarks: <1.5: 0, 1.5-3: 6, >3: 12
      if (monthsOfLiquidityValue > 3) {
        monthsOfLiquidityScore = 12;
      } else if (monthsOfLiquidityValue >= 1.5) {
        monthsOfLiquidityScore = 6;
      } else {
        monthsOfLiquidityScore = 0;
      }
    }

    // 8. OPERATING MARGIN (12 points max)
    // Formula: (Operating Revenue – Operating Expenses) ÷ Operating Revenue
    if (responses.operating_revenue && responses.operating_expenses) {
      const operatingRevenue = parseFloat(responses.operating_revenue);
      const operatingExpenses = parseFloat(responses.operating_expenses);
      
      operatingMarginValue = (operatingRevenue - operatingExpenses) / operatingRevenue;
      
      // Benchmarks: <2.7%: 0, 2.7-3.0%: 6, >3%: 12
      if (operatingMarginValue > 0.03) {
        operatingMarginScore = 12;
      } else if (operatingMarginValue >= 0.027) {
        operatingMarginScore = 6;
      } else {
        operatingMarginScore = 0;
      }
    }

    // 9. DEBT RATIO (8 points max)
    // Formula: Total Debt ÷ Unrestricted Net Assets
    if (responses.total_debt && responses.unrestricted_net_assets) {
      const totalDebt = parseFloat(responses.total_debt);
      const unrestrictedNetAssets = parseFloat(responses.unrestricted_net_assets);
      
      debtRatioValue = totalDebt / unrestrictedNetAssets;
      
      // Benchmarks: <22.5%: 0, 22.5-27%: 4, >27%: 8
      if (debtRatioValue > 0.27) {
        debtRatioScore = 8;
      } else if (debtRatioValue >= 0.225) {
        debtRatioScore = 4;
      } else {
        debtRatioScore = 0;
      }
    }

    // 10. OPERATING REVENUE MIX (4 points max)
    // Formula: |(Program Revenue / Total Operating Revenue) - (Membership Revenue / Total Operating Revenue)|
    if (responses.program_revenue && responses.membership_revenue && responses.total_operating_revenue) {
      const programRevenue = parseFloat(responses.program_revenue);
      const membershipRevenue = parseFloat(responses.membership_revenue);
      const totalOperatingRevenue = parseFloat(responses.total_operating_revenue);
      
      operatingRevenueMixValue = Math.abs((programRevenue / totalOperatingRevenue) - (membershipRevenue / totalOperatingRevenue));
      
      // Benchmarks: >40%: 0, 20-40%: 2, <20%: 4
      if (operatingRevenueMixValue < 0.20) {
        operatingRevenueMixScore = 4;
      } else if (operatingRevenueMixValue <= 0.40) {
        operatingRevenueMixScore = 2;
      } else {
        operatingRevenueMixScore = 0;
      }
    }

    // 11. CHARITABLE REVENUE (4 points max)
    // Formula: Charitable Revenue ÷ Operating Revenue
    if (responses.charitable_revenue && responses.operating_revenue) {
      const charitableRevenue = parseFloat(responses.charitable_revenue);
      const operatingRevenue = parseFloat(responses.operating_revenue);
      
      charitableRevenueValue = charitableRevenue / operatingRevenue;
      
      // Benchmarks: <9.8%: 0, 9.8-15%: 2, >15%: 4
      if (charitableRevenueValue > 0.15) {
        charitableRevenueScore = 4;
      } else if (charitableRevenueValue >= 0.098) {
        charitableRevenueScore = 2;
      } else {
        charitableRevenueScore = 0;
      }
    }

    // Calculate totals
    const operationalTotalPoints = membershipGrowthScore + staffRetentionScore + graceScore + 
                                 riskMitigationScore + governanceScore + engagementScore;
    const financialTotalPoints = monthsOfLiquidityScore + operatingMarginScore + 
                                debtRatioScore + operatingRevenueMixScore + charitableRevenueScore;
    const totalPoints = operationalTotalPoints + financialTotalPoints;
    const maxPoints = 80;
    const percentageScore = (totalPoints / maxPoints) * 100;

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
      maxPoints,
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
