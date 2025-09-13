import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDraftsTable1705000000017 implements MigrationInterface {
  name = 'CreateDraftsTable1705000000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create drafts table
    await queryRunner.createTable(
      new Table({
        name: 'drafts',
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
            isNullable: false,
          },
          {
            name: 'totalQuestions',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'responses',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'completed',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'submittedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'organizationId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'archived'],
            default: "'draft'",
            isNullable: false,
          },
          {
            name: 'submittedAsSubmissionId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reopenedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'reopenedBy',
            type: 'varchar',
            length: '255',
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
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for drafts table
    await queryRunner.createIndex('drafts', new TableIndex({
      name: 'ix_draft_tuple',
      columnNames: ['organizationId', 'periodId', 'status'],
    }));

    await queryRunner.createIndex('drafts', new TableIndex({
      name: 'ix_draft_submitted_as_submission_id',
      columnNames: ['submittedAsSubmissionId'],
    }));

    // Create unique constraint for one active draft per (organizationId, periodId)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_draft_active_org_period
      ON drafts ("organizationId", "periodId")
      WHERE status = 'draft';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS ux_draft_active_org_period`);
    await queryRunner.dropIndex('drafts', 'ix_draft_submitted_as_submission_id');
    await queryRunner.dropIndex('drafts', 'ix_draft_tuple');

    // Drop table
    await queryRunner.dropTable('drafts');
  }
}
