import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCeoApprovalConstraints1700000000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique constraint for active drafts (one per org+period)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ux_draft_active_org_period"
      ON "drafts" ("organizationId", "periodId")
      WHERE status = 'DRAFT'
    `);

    // Add unique constraint for submissions (one per org+period)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ux_submission_org_period"
      ON "submissions" ("organizationId", "periodId")
    `);

    // Add audit fields to Draft entity
    await queryRunner.query(`
      ALTER TABLE "drafts" 
      ADD COLUMN IF NOT EXISTS "submitted_as_submission_id" UUID,
      ADD COLUMN IF NOT EXISTS "reopened_at" TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS "reopened_by" VARCHAR(255)
    `);

    // Add audit fields to Submission entity
    await queryRunner.query(`
      ALTER TABLE "submissions" 
      ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS "approved_by" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "reopened_at" TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS "reopened_by" VARCHAR(255)
    `);

    // Update existing submissions to have OPEN status if they were in DRAFT status
    await queryRunner.query(`
      UPDATE "submissions" 
      SET status = 'OPEN' 
      WHERE status = 'draft' OR status = 'submitted'
    `);

    // Update existing drafts to have proper status values
    await queryRunner.query(`
      UPDATE "drafts" 
      SET status = 'DRAFT' 
      WHERE status = 'draft'
    `);

    await queryRunner.query(`
      UPDATE "drafts" 
      SET status = 'ARCHIVED' 
      WHERE status = 'archived'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ux_draft_active_org_period"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ux_submission_org_period"`);

    // Remove audit fields from Draft entity
    await queryRunner.query(`
      ALTER TABLE "drafts" 
      DROP COLUMN IF EXISTS "submitted_as_submission_id",
      DROP COLUMN IF EXISTS "reopened_at",
      DROP COLUMN IF EXISTS "reopened_by"
    `);

    // Remove audit fields from Submission entity
    await queryRunner.query(`
      ALTER TABLE "submissions" 
      DROP COLUMN IF EXISTS "approved_at",
      DROP COLUMN IF EXISTS "approved_by",
      DROP COLUMN IF EXISTS "reopened_at",
      DROP COLUMN IF EXISTS "reopened_by"
    `);
  }
}
