import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrganizationIdType1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the existing column
    await queryRunner.query(`ALTER TABLE "submissions" DROP COLUMN "organizationId"`);
    
    // Then add it back as UUID type
    await queryRunner.query(`ALTER TABLE "submissions" ADD "organizationId" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to varchar
    await queryRunner.query(`ALTER TABLE "submissions" DROP COLUMN "organizationId"`);
    await queryRunner.query(`ALTER TABLE "submissions" ADD "organizationId" character varying(255)`);
  }
}
