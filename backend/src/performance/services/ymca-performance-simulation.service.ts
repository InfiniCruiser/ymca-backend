import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationType } from '../../organizations/entities/organization.entity';
import { PerformanceCalculation } from '../entities/performance-calculation.entity';

@Injectable()
export class YMCAPerformanceSimulationService {
  private readonly logger = new Logger(YMCAPerformanceSimulationService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(PerformanceCalculation)
    private performanceRepository: Repository<PerformanceCalculation>,
  ) {}

  async generateSimulationsForAllYMCAs(): Promise<{ message: string; generatedCount: number }> {
    try {
      this.logger.log('🚀 Starting YMCA performance simulation generation...');
      
      // Debug: Check if repository is working
      this.logger.log('🔍 Checking organization repository...');
      const totalOrgs = await this.organizationRepository.count();
      this.logger.log(`📊 Total organizations in database: ${totalOrgs}`);
      
      // Get all YMCA organizations
      this.logger.log('🔍 Querying for YMCA organizations...');
      const organizations = await this.organizationRepository.find({
        where: { type: OrganizationType.LOCAL_Y }
      });
      
      this.logger.log(`🏢 Found ${organizations.length} YMCA organizations`);
      
      if (organizations.length === 0) {
        this.logger.warn('No YMCA organizations found');
        return { message: 'No YMCA organizations found', generatedCount: 0 };
      }

      this.logger.log(`📊 Found ${organizations.length} YMCA organizations to simulate`);

      let generatedCount = 0;
      const errors: string[] = [];

      for (const organization of organizations) {
        try {
          const simulation = this.generateRealisticPerformance(organization);
          await this.performanceRepository.save(simulation);
          generatedCount++;
          
          if (generatedCount % 10 === 0) {
            this.logger.log(`✅ Generated ${generatedCount}/${organizations.length} simulations`);
          }
        } catch (error) {
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

    } catch (error) {
      this.logger.error('❌ Error generating simulations:', error);
      throw error;
    }
  }

  async testOrganizationRepository(): Promise<{ message: string; totalCount: number; ymcaCount: number }> {
    try {
      this.logger.log('🧪 Testing organization repository...');
      
      const totalOrgs = await this.organizationRepository.count();
      this.logger.log(`📊 Total organizations: ${totalOrgs}`);
      
      const ymcaOrgs = await this.organizationRepository.find({
        where: { type: OrganizationType.LOCAL_Y }
      });
      this.logger.log(`🏢 YMCA organizations: ${ymcaOrgs.length}`);
      
      return {
        message: 'Organization repository test completed',
        totalCount: totalOrgs,
        ymcaCount: ymcaOrgs.length
      };
    } catch (error) {
      this.logger.error('❌ Error testing organization repository:', error);
      throw error;
    }
  }

  private generateRealisticPerformance(organization: Organization): PerformanceCalculation {
    const simulation = new PerformanceCalculation();
    
    // Set basic information
    simulation.organizationId = organization.id;
    simulation.period = 'simulation-period-2024';
    simulation.calculatedAt = new Date();
    // simulation.isSimulated = true; // Mark as simulated data
    
    // Generate realistic scores based on YMCA characteristics
    const scores = this.generateScoresBasedOnCharacteristics(organization);
    
    // Set all the performance scores
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
    simulation.charitableRevenueScore = scores.revenueMix; // Map to charitable revenue
    
    // Calculate totals
    simulation.operationalTotalPoints = scores.operationalTotal;
    simulation.financialTotalPoints = scores.financialTotal;
    simulation.totalPoints = scores.operationalTotal + scores.financialTotal;
    simulation.maxPoints = 80; // Based on your scoring framework
    simulation.percentageScore = Math.round((simulation.totalPoints / simulation.maxPoints) * 100);
    
    // Set support designation based on total score
    simulation.supportDesignation = this.determineSupportDesignation(simulation.totalPoints);
    
    return simulation;
  }

  private generateScoresBasedOnCharacteristics(organization: Organization) {
    // Base scores with some randomness
    const baseScores = {
      membershipGrowth: this.randomScore(0, 4, 2), // 0-4 points
      staffRetention: this.randomScore(0, 4, 2),
      graceScore: this.randomScore(0, 4, 2),
      riskMitigation: this.randomScore(0, 8, 4), // 0-8 points
      governance: this.randomScore(0, 12, 6), // 0-12 points
      engagement: this.randomScore(0, 8, 4), // 0-8 points
      monthsLiquidity: this.randomScore(0, 12, 6), // 0-12 points
      operatingMargin: this.randomScore(0, 12, 6), // 0-12 points
      debtRatio: this.randomScore(0, 8, 4), // 0-8 points
      revenueMix: this.randomScore(0, 4, 2), // 0-4 points
    };

    // Adjust scores based on YMCA characteristics
    this.adjustScoresBasedOnCharacteristics(baseScores, organization);

    // Calculate totals
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

  private adjustScoresBasedOnCharacteristics(scores: any, organization: Organization) {
    // Adjust based on budget range
    if (organization.budgetRange) {
      if (organization.budgetRange.includes('$1,000,000')) {
        // Larger budget YMCAs tend to have better financial scores
        scores.monthsLiquidity = Math.min(12, scores.monthsLiquidity + 2);
        scores.operatingMargin = Math.min(12, scores.operatingMargin + 2);
        scores.governance = Math.min(12, scores.governance + 2);
      } else if (organization.budgetRange.includes('$250,000')) {
        // Smaller budget YMCAs might struggle more
        scores.monthsLiquidity = Math.max(0, scores.monthsLiquidity - 1);
        scores.operatingMargin = Math.max(0, scores.operatingMargin - 1);
      }
    }

    // Adjust based on member group
    if (organization.memberGroup) {
      if (organization.memberGroup.includes('Large')) {
        // Large YMCAs tend to have better operational scores
        scores.membershipGrowth = Math.min(4, scores.membershipGrowth + 1);
        scores.engagement = Math.min(8, scores.engagement + 1);
      } else if (organization.memberGroup.includes('Small')) {
        // Small YMCAs might have more intimate engagement
        scores.graceScore = Math.min(4, scores.graceScore + 1);
        scores.staffRetention = Math.min(4, scores.staffRetention + 1);
      }
    }

    // Adjust based on facility type
    if (organization.facilityType === 'Facility') {
      // Full facilities tend to have better program revenue
      scores.programRevenue = Math.min(4, scores.programRevenue + 1);
      scores.engagement = Math.min(8, scores.engagement + 1);
    }
  }

  private randomScore(min: number, max: number, preferredValue: number): number {
    // Generate scores with a preference for the middle range
    const random = Math.random();
    
    if (random < 0.4) {
      // 40% chance to get close to preferred value
      return Math.max(min, Math.min(max, preferredValue + Math.floor(Math.random() * 3) - 1));
    } else if (random < 0.7) {
      // 30% chance to get a random value
      return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      // 30% chance to get a lower value (some YMCAs struggle)
      return Math.floor(Math.random() * (preferredValue - min + 1)) + min;
    }
  }

  private determineSupportDesignation(totalScore: number): string {
    if (totalScore >= 60) {
      return 'Y-USA Support';
    } else if (totalScore >= 40) {
      return 'Independent Improvement';
    } else {
      return 'Intensive Support';
    }
  }
}
