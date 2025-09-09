import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePeriodCompletionsTable1700000000006 implements MigrationInterface {
  name = 'CreatePeriodCompletionsTable1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'period_completions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organizationId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'periodId',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'submissionId',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['incomplete', 'partial', 'complete'],
            default: "'incomplete'",
          },
          {
            name: 'totalCategories',
            type: 'int',
            default: 17,
          },
          {
            name: 'completedCategories',
            type: 'int',
            default: 0,
          },
          {
            name: 'firstUploadDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'canReopen',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes using raw SQL
    await queryRunner.query(`
      CREATE INDEX "IDX_period_completions_organization_period" 
      ON "period_completions" ("organizationId", "periodId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_period_completions_submission" 
      ON "period_completions" ("submissionId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_period_completions_first_upload" 
      ON "period_completions" ("firstUploadDate")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('period_completions');
  }
}
