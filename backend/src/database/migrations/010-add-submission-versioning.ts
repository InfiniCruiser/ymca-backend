import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddSubmissionVersioning1705000000010 implements MigrationInterface {
  name = 'AddSubmissionVersioning1705000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to submissions table
    await queryRunner.addColumns('submissions', [
      new TableColumn({
        name: 'version',
        type: 'int',
        default: 1,
        isNullable: false,
      }),
      new TableColumn({
        name: 'parentSubmissionId',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'isLatest',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['draft', 'submitted', 'locked'],
        default: "'draft'",
        isNullable: false,
      }),
      new TableColumn({
        name: 'submittedAt',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'autoSubmittedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);

    // Add new columns to file_uploads table
    await queryRunner.addColumns('file_uploads', [
      new TableColumn({
        name: 'isSnapshot',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'originalUploadId',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'snapshotCreatedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);

    // Create indexes for better query performance
    await queryRunner.createIndex('submissions', new TableIndex({
      name: 'IDX_submissions_org_period_latest',
      columnNames: ['organizationId', 'periodId', 'isLatest'],
    }));

    await queryRunner.createIndex('submissions', new TableIndex({
      name: 'IDX_submissions_org_period_version',
      columnNames: ['organizationId', 'periodId', 'version'],
    }));

    await queryRunner.createIndex('submissions', new TableIndex({
      name: 'IDX_submissions_status',
      columnNames: ['status'],
    }));

    await queryRunner.createIndex('file_uploads', new TableIndex({
      name: 'IDX_file_uploads_submission_snapshot',
      columnNames: ['submissionId', 'isSnapshot'],
    }));

    // Update existing submissions to have proper defaults
    await queryRunner.query(`
      UPDATE submissions 
      SET 
        version = 1,
        isLatest = true,
        status = CASE 
          WHEN completed = true THEN 'submitted'
          ELSE 'draft'
        END,
        submittedAt = CASE 
          WHEN completed = true THEN "updatedAt"
          ELSE NULL
        END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('file_uploads', new TableIndex({
      name: 'IDX_file_uploads_submission_snapshot',
      columnNames: ['submissionId', 'isSnapshot'],
    }));
    await queryRunner.dropIndex('submissions', new TableIndex({
      name: 'IDX_submissions_status',
      columnNames: ['status'],
    }));
    await queryRunner.dropIndex('submissions', new TableIndex({
      name: 'IDX_submissions_org_period_version',
      columnNames: ['organizationId', 'periodId', 'version'],
    }));
    await queryRunner.dropIndex('submissions', new TableIndex({
      name: 'IDX_submissions_org_period_latest',
      columnNames: ['organizationId', 'periodId', 'isLatest'],
    }));

    // Remove columns from file_uploads table
    await queryRunner.dropColumns('file_uploads', [
      'snapshotCreatedAt',
      'originalUploadId',
      'isSnapshot',
    ]);

    // Remove columns from submissions table
    await queryRunner.dropColumns('submissions', [
      'autoSubmittedAt',
      'submittedAt',
      'status',
      'isLatest',
      'parentSubmissionId',
      'version',
    ]);
  }
}
