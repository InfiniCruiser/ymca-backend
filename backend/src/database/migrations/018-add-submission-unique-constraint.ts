import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmissionUniqueConstraint1705000000018 implements MigrationInterface {
  name = 'AddSubmissionUniqueConstraint1705000000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create unique constraint for one submission per (organizationId, periodId)
    // This is done in a separate migration after the enum value is committed
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_submission_org_period
      ON submissions ("organizationId", "periodId")
      WHERE status IN ('open', 'locked');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS ux_submission_org_period`);
  }
}
