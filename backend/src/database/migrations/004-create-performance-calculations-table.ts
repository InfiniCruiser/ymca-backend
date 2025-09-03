import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePerformanceCalculationsTable1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create performance_calculations table matching the exact schema from Heroku
    await queryRunner.query(`
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
    await queryRunner.query(`
      ALTER TABLE "performance_calculations" 
      ADD CONSTRAINT "FK_performance_calculations_organization" 
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "performance_calculations" 
      ADD CONSTRAINT "FK_performance_calculations_submission" 
      FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE SET NULL
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_performance_calculations_organization" ON "performance_calculations" ("organizationId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_performance_calculations_submission" ON "performance_calculations" ("submissionId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_performance_calculations_period" ON "performance_calculations" ("period")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_performance_calculations_performance_category" ON "performance_calculations" ("performanceCategory")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_performance_calculations_performance_category"`);
    await queryRunner.query(`DROP INDEX "IDX_performance_calculations_period"`);
    await queryRunner.query(`DROP INDEX "IDX_performance_calculations_submission"`);
    await queryRunner.query(`DROP INDEX "IDX_performance_calculations_organization"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "performance_calculations" 
      DROP CONSTRAINT "FK_performance_calculations_submission"
    `);

    await queryRunner.query(`
      ALTER TABLE "performance_calculations" 
      DROP CONSTRAINT "FK_performance_calculations_organization"
    `);

    // Drop the table
    await queryRunner.query(`DROP TABLE "performance_calculations"`);
  }
}
