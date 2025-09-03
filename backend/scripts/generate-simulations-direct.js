const { DataSource } = require('typeorm');
const { Organization } = require('../dist/backend/src/organizations/entities/organization.entity.js');
const { PerformanceCalculation } = require('../dist/backend/src/performance/entities/performance-calculation.entity.js');
const { Submission } = require('../dist/backend/src/submissions/entities/submission.entity.js');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'ymca_portal',
  entities: [Organization, PerformanceCalculation, Submission],
  synchronize: false,
});

async function generateSimulations() {
  try {
    await dataSource.initialize();
    console.log('🔌 Connected to database');

    const orgRepo = dataSource.getRepository(Organization);
    const perfRepo = dataSource.getRepository(PerformanceCalculation);
    
    // Get all YMCA organizations
    const organizations = await orgRepo.find({
      where: { type: 'LOCAL_Y' }
    });
    
    console.log(`📊 Found ${organizations.length} YMCA organizations to simulate`);

    let generatedCount = 0;
    const errors = [];

    for (const organization of organizations) {
      try {
        const simulation = generateRealisticPerformance(organization);
        await perfRepo.save(simulation);
        generatedCount++;
        
        if (generatedCount % 10 === 0) {
          console.log(`✅ Generated ${generatedCount}/${organizations.length} simulations`);
        }
      } catch (error) {
        const errorMsg = `Failed to generate simulation for ${organization.name}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`🎉 Successfully generated ${generatedCount} performance simulations`);
    
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} errors occurred during generation`);
    }

    // Verify the results
    const totalSimulations = await perfRepo.count();
    console.log(`📊 Total performance calculations in database: ${totalSimulations}`);

  } catch (error) {
    console.error('❌ Error generating simulations:', error);
  } finally {
    await dataSource.destroy();
  }
}

function generateRealisticPerformance(organization) {
  const simulation = {
    organizationId: organization.id,
    period: 'simulation-period-2024',
    calculatedAt: new Date(),
    // isSimulated: true, // Field not in database yet
  };
  
  // Generate realistic scores
  const scores = generateScoresBasedOnCharacteristics(organization);
  
  // Set performance scores
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
  
  // Calculate totals
  simulation.operationalTotalPoints = scores.operationalTotal;
  simulation.financialTotalPoints = scores.financialTotal;
  simulation.totalPoints = scores.operationalTotal + scores.financialTotal;
  simulation.maxPoints = 80;
  simulation.percentageScore = Math.round((simulation.totalPoints / simulation.maxPoints) * 100);
  
  // Set support designation
  simulation.supportDesignation = determineSupportDesignation(simulation.totalPoints);
  
  return simulation;
}

function generateScoresBasedOnCharacteristics(organization) {
  // Base scores with some randomness
  const baseScores = {
    membershipGrowth: randomScore(0, 4, 2),
    staffRetention: randomScore(0, 4, 2),
    graceScore: randomScore(0, 4, 2),
    riskMitigation: randomScore(0, 8, 4),
    governance: randomScore(0, 12, 6),
    engagement: randomScore(0, 8, 4),
    monthsLiquidity: randomScore(0, 12, 6),
    operatingMargin: randomScore(0, 12, 6),
    debtRatio: randomScore(0, 8, 4),
    revenueMix: randomScore(0, 4, 2),
  };

  // Adjust scores based on YMCA characteristics
  adjustScoresBasedOnCharacteristics(baseScores, organization);

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

function adjustScoresBasedOnCharacteristics(scores, organization) {
  // Adjust based on budget range
  if (organization.budgetRange) {
    if (organization.budgetRange.includes('$1,000,000')) {
      scores.monthsLiquidity = Math.min(12, scores.monthsLiquidity + 2);
      scores.operatingMargin = Math.min(12, scores.operatingMargin + 2);
      scores.governance = Math.min(12, scores.governance + 2);
    } else if (organization.budgetRange.includes('$250,000')) {
      scores.monthsLiquidity = Math.max(0, scores.monthsLiquidity - 1);
      scores.operatingMargin = Math.max(0, scores.operatingMargin - 1);
    }
  }

  // Adjust based on member group
  if (organization.memberGroup) {
    if (organization.memberGroup.includes('Large')) {
      scores.membershipGrowth = Math.min(4, scores.membershipGrowth + 1);
      scores.engagement = Math.min(8, scores.engagement + 1);
    } else if (organization.memberGroup.includes('Small')) {
      scores.graceScore = Math.min(4, scores.graceScore + 1);
      scores.staffRetention = Math.min(4, scores.staffRetention + 1);
    }
  }

  // Adjust based on facility type
  if (organization.facilityType === 'Facility') {
    scores.revenueMix = Math.min(4, scores.revenueMix + 1);
    scores.engagement = Math.min(8, scores.engagement + 1);
  }
}

function randomScore(min, max, preferredValue) {
  const random = Math.random();
  
  if (random < 0.4) {
    return Math.max(min, Math.min(max, preferredValue + Math.floor(Math.random() * 3) - 1));
  } else if (random < 0.7) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    return Math.floor(Math.random() * (preferredValue - min + 1)) + min;
  }
}

function determineSupportDesignation(totalScore) {
  if (totalScore >= 60) {
    return 'Y-USA Support';
  } else if (totalScore >= 40) {
    return 'Independent Improvement';
  } else {
    return 'Intensive Support';
  }
}

generateSimulations();
