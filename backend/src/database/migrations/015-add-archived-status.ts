import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArchivedStatus1705000000015 implements MigrationInterface {
  name = 'AddArchivedStatus1705000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'archived' to the existing submissions_status_enum
    await queryRunner.query(`
      ALTER TYPE "submissions_status_enum" ADD VALUE 'archived';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type and updating all references
    // For now, we'll leave the 'archived' value in place
    console.log('Note: Cannot remove enum value "archived" - would require recreating enum type');
  }
}
