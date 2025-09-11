import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscardedStatus1700000000012 implements MigrationInterface {
  name = 'AddDiscardedStatus1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add discarded status to the enum
    await queryRunner.query(`
      ALTER TYPE submissions_status_enum ADD VALUE 'discarded';
    `);

    // Add discarded fields to submissions table
    await queryRunner.query(`
      ALTER TABLE submissions 
      ADD COLUMN "discardedAt" TIMESTAMP,
      ADD COLUMN "discardedBy" VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove discarded fields
    await queryRunner.query(`
      ALTER TABLE submissions 
      DROP COLUMN "discardedAt",
      DROP COLUMN "discardedBy";
    `);

    // Note: PostgreSQL doesn't support removing enum values easily
    // The discarded status will remain in the enum but won't be used
  }
}
