import { MigrationInterface, QueryRunner } from 'typeorm';

export class CeoApprovalFlow1705000000016 implements MigrationInterface {
  name = 'CeoApprovalFlow1705000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new status values for CEO approval flow
    await queryRunner.query(`
      ALTER TYPE submissions_status_enum ADD VALUE IF NOT EXISTS 'open';
    `);

    // Add audit fields for CEO actions
    await queryRunner.query(`
      ALTER TABLE submissions 
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS approved_by TEXT,
      ADD COLUMN IF NOT EXISTS reopened_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS reopened_by TEXT;
    `);

    // Create unique constraint for one active draft per (organizationId, periodId)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_draft_active_org_period
      ON submissions ("organizationId", "periodId")
      WHERE status = 'draft';
    `);

    // Create unique constraint for one submission per (organizationId, periodId)
    // Note: We'll create this in a separate migration after the enum is committed
    // await queryRunner.query(`
    //   CREATE UNIQUE INDEX IF NOT EXISTS ux_submission_org_period
    //   ON submissions ("organizationId", "periodId")
    //   WHERE status IN ('open', 'locked');
    // `);

    // Add relationship field from draft to submission
    await queryRunner.query(`
      ALTER TABLE submissions 
      ADD COLUMN IF NOT EXISTS submitted_as_submission_id UUID;
    `);

    // Add helpful lookup index for tuple queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_submission_tuple
      ON submissions ("organizationId", "periodId");
    `);

    // Add index for submitted_as_submission_id lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_submitted_as_submission_id
      ON submissions (submitted_as_submission_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS ix_submitted_as_submission_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS ix_submission_tuple`);
    await queryRunner.query(`DROP INDEX IF EXISTS ux_submission_org_period`);
    await queryRunner.query(`DROP INDEX IF EXISTS ux_draft_active_org_period`);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE submissions 
      DROP COLUMN IF EXISTS submitted_as_submission_id,
      DROP COLUMN IF EXISTS reopened_by,
      DROP COLUMN IF EXISTS reopened_at,
      DROP COLUMN IF EXISTS approved_by,
      DROP COLUMN IF EXISTS approved_at;
    `);

    // Note: PostgreSQL doesn't support removing enum values easily
    // The 'open' status will remain in the enum but won't be used
  }
}
