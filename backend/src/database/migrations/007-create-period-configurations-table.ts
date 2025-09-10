import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreatePeriodConfigurationsTable1700000000007 implements MigrationInterface {
  name = 'CreatePeriodConfigurationsTable1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'period_configurations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'periodId',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'label',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'startDate',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'endDate',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'gracePeriodEndDate',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['upcoming', 'active', 'grace_period', 'closed'],
            default: "'upcoming'",
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'totalCategories',
            type: 'int',
            default: 17,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'settings',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'period_configurations',
      {
        name: 'IDX_period_configurations_periodId',
        columnNames: ['periodId'],
        isUnique: true
      }
    );

    await queryRunner.createIndex(
      'period_configurations',
      {
        name: 'IDX_period_configurations_status',
        columnNames: ['status']
      }
    );

    await queryRunner.createIndex(
      'period_configurations',
      {
        name: 'IDX_period_configurations_dates',
        columnNames: ['startDate', 'endDate']
      }
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('period_configurations');
  }
}
