import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSubmissionsTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'submissions',
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
          },
          {
            name: 'totalQuestions',
            type: 'int',
          },
          {
            name: 'responses',
            type: 'jsonb',
          },
          {
            name: 'completed',
            type: 'boolean',
            default: true,
          },
          {
            name: 'submittedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'organizationId',
            type: 'varchar',
            length: '255',
            isNullable: true,
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
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('submissions');
  }
}
