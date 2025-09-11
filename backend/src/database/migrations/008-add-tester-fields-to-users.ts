import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTesterFieldsToUsers0081700000008 implements MigrationInterface {
  name = 'AddTesterFieldsToUsers0081700000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if isTester column already exists
    const isTesterColumnExists = await queryRunner.hasColumn('users', 'isTester');
    if (!isTesterColumnExists) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'isTester',
          type: 'boolean',
          default: false,
          isNullable: false,
        })
      );
    }

    // Check if testerGroup column already exists
    const testerGroupColumnExists = await queryRunner.hasColumn('users', 'testerGroup');
    if (!testerGroupColumnExists) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'testerGroup',
          type: 'varchar',
          length: '100',
          isNullable: true,
        })
      );
    }

    // Check if TESTER role already exists in enum
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_enum WHERE enumlabel = 'TESTER' AND enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'users_role_enum'
      )
    `);
    
    if (enumExists.length === 0) {
      await queryRunner.query(`
        ALTER TYPE "public"."users_role_enum" ADD VALUE 'TESTER'
      `);
    }
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
