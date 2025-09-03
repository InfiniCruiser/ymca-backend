const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function fixPerformanceTable() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Check if the table exists
    const tableExists = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'performance_calculations'
      );
    `);

    if (tableExists[0].exists) {
      console.log('✅ performance_calculations table already exists');
      
      // Check if submissionId column exists
      const columnExists = await AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'performance_calculations' 
          AND column_name = 'submissionId'
        );
      `);

      if (columnExists[0].exists) {
        console.log('✅ submissionId column exists - table is properly configured');
        return;
      } else {
        console.log('⚠️ Table exists but missing submissionId column - adding it...');
        
        // Add the missing column
        await AppDataSource.query(`
          ALTER TABLE "performance_calculations" 
          ADD COLUMN "submissionId" uuid
        `);
        
        // Add foreign key constraint
        await AppDataSource.query(`
          ALTER TABLE "performance_calculations" 
          ADD CONSTRAINT "FK_performance_calculations_submission" 
          FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE SET NULL
        `);
        
        console.log('✅ Added submissionId column and foreign key constraint');
      }
    } else {
      console.log('🔄 Creating performance_calculations table...');
      
      // Create the table matching exact schema from Heroku
      await AppDataSource.query(`
        CREATE TABLE "performance_calculations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "organizationId" uuid NOT NULL,
          "submissionId" uuid,
          "period" character varying(50) NOT NULL,
          "calculatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          
          -- Operational Performance metrics (matching exact order from database)
          "membershipGrowthScore" numeric(5,2),
          "staffRetentionScore" numeric(5,2),
          "riskMitigationScore" numeric(5,2),
          "governanceScore" numeric(5,2),
          "engagementScore" numeric(5,2),
          "totalPoints" numeric(5,2),
          "maxPoints" numeric(5,2) NOT NULL DEFAULT '80'::numeric,
          "percentageScore" numeric(5,2),
          "performanceCategory" character varying(20),
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "graceScore" numeric(5,2),
          "monthsOfLiquidityScore" numeric(5,2),
          "operatingMarginScore" numeric(5,2),
          "debtRatioScore" numeric(5,2),
          "operatingRevenueMixScore" numeric(5,2),
          "charitableRevenueScore" numeric(5,2),
          "operationalTotalPoints" numeric(5,2),
          "financialTotalPoints" numeric(5,2),
          "supportDesignation" character varying(50),
          "operationalSupportDesignation" character varying(50),
          "financialSupportDesignation" character varying(50),
          "membershipGrowthValue" numeric(10,4),
          "staffRetentionValue" numeric(10,4),
          "graceScoreValue" numeric(10,4),
          "monthsOfLiquidityValue" numeric(10,4),
          "operatingMarginValue" numeric(10,4),
          "debtRatioValue" numeric(10,4),
          "operatingRevenueMixValue" numeric(10,4),
          "charitableRevenueValue" numeric(10,4),
          "calculationMetadata" jsonb,
          
          CONSTRAINT "PK_performance_calculations" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_performance_calculations_org_period" UNIQUE ("organizationId", "period")
        )
      `);

      // Add foreign key constraints
      await AppDataSource.query(`
        ALTER TABLE "performance_calculations" 
        ADD CONSTRAINT "FK_performance_calculations_organization" 
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
      `);

      await AppDataSource.query(`
        ALTER TABLE "performance_calculations" 
        ADD CONSTRAINT "FK_performance_calculations_submission" 
        FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE SET NULL
      `);

      // Create indexes for better performance
      await AppDataSource.query(`
        CREATE INDEX "IDX_performance_calculations_organization" ON "performance_calculations" ("organizationId")
      `);

      await AppDataSource.query(`
        CREATE INDEX "IDX_performance_calculations_submission" ON "performance_calculations" ("submissionId")
      `);

      await AppDataSource.query(`
        CREATE INDEX "IDX_performance_calculations_period" ON "performance_calculations" ("period")
      `);

      await AppDataSource.query(`
        CREATE INDEX "IDX_performance_calculations_performance_category" ON "performance_calculations" ("performanceCategory")
      `);

      console.log('✅ performance_calculations table created successfully with all columns and constraints');
    }

    // Final verification
    const finalCheck = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'performance_calculations' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Final table structure:');
    finalCheck.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Error fixing performance table:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

fixPerformanceTable();
