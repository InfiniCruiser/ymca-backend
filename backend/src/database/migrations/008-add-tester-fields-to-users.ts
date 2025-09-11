import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTesterFieldsToUsers008 implements MigrationInterface {
  name = 'AddTesterFieldsToUsers008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add isTester column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isTester',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );

    // Add testerGroup column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'testerGroup',
        type: 'varchar',
        length: '100',
        isNullable: true,
      })
    );

    // Update the role enum to include TESTER
    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" ADD VALUE 'TESTER'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove testerGroup column
    await queryRunner.dropColumn('users', 'testerGroup');

    // Remove isTester column
    await queryRunner.dropColumn('users', 'isTester');

    // Note: PostgreSQL doesn't support removing enum values directly
    // The TESTER value will remain in the enum but won't be used
  }
}
