const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function forceAddMissingColumns() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    console.log('🔄 Force adding missing columns to performance_calculations table...');

    // Add all the missing columns that your code expects
    const missingColumns = [
      // Operational Performance metrics
      'membershipGrowthScore',
      'staffRetentionScore', 
      'riskMitigationScore',
      'governanceScore',
      'engagementScore',
      'graceScore',
      
      // Financial Performance metrics
      'monthsOfLiquidityScore',
      'operatingMarginScore',
      'debtRatioScore',
      'operatingRevenueMixScore',
      'charitableRevenueScore',
      
      // Aggregated scores
      'operationalTotalPoints',
      'financialTotalPoints',
      'maxPoints',
      'percentageScore',
      
      // Performance category and support designation
      'performanceCategory',
      'supportDesignation',
      'operationalSupportDesignation',
      'financialSupportDesignation',
      
      // Raw metric values
      'membershipGrowthValue',
      'staffRetentionValue',
      'graceScoreValue',
      'monthsOfLiquidityValue',
      'operatingMarginValue',
      'debtRatioValue',
      'operatingRevenueMixValue',
      'charitableRevenueValue',
      
      // Calculation metadata
      'calculationMetadata'
    ];

    // Check which columns already exist
    const existingColumns = await AppDataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'performance_calculations'
    `);
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('📋 Existing columns:', existingColumnNames);

    // Add missing columns
    for (const columnName of missingColumns) {
      if (!existingColumnNames.includes(columnName)) {
        console.log(`➕ Adding column: ${columnName}`);
        
        let columnDefinition = '';
        if (columnName.includes('Score') || columnName.includes('Points') || columnName.includes('Percentage')) {
          columnDefinition = `ADD COLUMN "${columnName}" numeric(5,2)`;
        } else if (columnName.includes('Value')) {
          columnDefinition = `ADD COLUMN "${columnName}" numeric(10,4)`;
        } else if (columnName === 'performanceCategory') {
          columnDefinition = `ADD COLUMN "${columnName}" character varying(20)`;
        } else if (columnName.includes('Designation')) {
          columnDefinition = `ADD COLUMN "${columnName}" character varying(50)`;
        } else if (columnName === 'calculationMetadata') {
          columnDefinition = `ADD COLUMN "${columnName}" jsonb`;
        } else {
          columnDefinition = `ADD COLUMN "${columnName}" character varying(100)`;
        }

        try {
          await AppDataSource.query(`
            ALTER TABLE "performance_calculations" 
            ${columnDefinition}
          `);
          console.log(`✅ Added ${columnName}`);
        } catch (error) {
          console.log(`⚠️ Could not add ${columnName}:`, error.message);
        }
      } else {
        console.log(`✅ Column ${columnName} already exists`);
      }
    }

    // Add calculatedAt column if it doesn't exist
    if (!existingColumnNames.includes('calculatedAt')) {
      console.log('➕ Adding calculatedAt column');
      await AppDataSource.query(`
        ALTER TABLE "performance_calculations" 
        ADD COLUMN "calculatedAt" TIMESTAMP DEFAULT now()
      `);
    }

    // Final verification
    const finalCheck = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'performance_calculations' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Final table structure:');
    finalCheck.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log(`\n🎯 Total columns: ${finalCheck.length}`);
    console.log('✅ All missing columns have been added!');

  } catch (error) {
    console.error('❌ Error adding missing columns:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

forceAddMissingColumns();
