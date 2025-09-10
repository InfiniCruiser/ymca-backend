import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateGradingTables1704067200000 implements MigrationInterface {
  name = 'CreateGradingTables1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document_category_grades table
    await queryRunner.createTable(
      new Table({
        name: 'document_category_grades',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
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
            name: 'categoryId',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'score',
            type: 'decimal',
            precision: 3,
            scale: 1,
            isNullable: false,
          },
          {
            name: 'reasoning',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'reviewerId',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'reviewedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for document_category_grades
    await queryRunner.createIndex(
      'document_category_grades',
      new Index('IDX_document_category_grades_org_period_category', ['organizationId', 'periodId', 'categoryId'], {
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'document_category_grades',
      new Index('IDX_document_category_grades_org_period', ['organizationId', 'periodId']),
    );

    await queryRunner.createIndex(
      'document_category_grades',
      new Index('IDX_document_category_grades_category', ['categoryId']),
    );

    await queryRunner.createIndex(
      'document_category_grades',
      new Index('IDX_document_category_grades_reviewer', ['reviewerId']),
    );

    // Create review_submissions table
    await queryRunner.createTable(
      new Table({
        name: 'review_submissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
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
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in-review', 'submitted', 'approved', 'rejected'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'submittedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'submittedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'approvedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'approvedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejectedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'rejectedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejectionReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'approvalNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rejectionNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'finalScore',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for review_submissions
    await queryRunner.createIndex(
      'review_submissions',
      new Index('IDX_review_submissions_org_period', ['organizationId', 'periodId'], {
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'review_submissions',
      new Index('IDX_review_submissions_status', ['status']),
    );

    await queryRunner.createIndex(
      'review_submissions',
      new Index('IDX_review_submissions_submitted_by', ['submittedBy']),
    );

    await queryRunner.createIndex(
      'review_submissions',
      new Index('IDX_review_submissions_approved_by', ['approvedBy']),
    );

    // Create review_history table
    await queryRunner.createTable(
      new Table({
        name: 'review_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
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
            name: 'categoryId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['graded', 'submitted', 'approved', 'rejected', 'status_changed'],
            isNullable: false,
          },
          {
            name: 'performedBy',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'performedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for review_history
    await queryRunner.createIndex(
      'review_history',
      new Index('IDX_review_history_org_period', ['organizationId', 'periodId']),
    );

    await queryRunner.createIndex(
      'review_history',
      new Index('IDX_review_history_performed_by', ['performedBy']),
    );

    await queryRunner.createIndex(
      'review_history',
      new Index('IDX_review_history_action', ['action']),
    );

    await queryRunner.createIndex(
      'review_history',
      new Index('IDX_review_history_performed_at', ['performedAt']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('review_history', 'IDX_review_history_performed_at');
    await queryRunner.dropIndex('review_history', 'IDX_review_history_action');
    await queryRunner.dropIndex('review_history', 'IDX_review_history_performed_by');
    await queryRunner.dropIndex('review_history', 'IDX_review_history_org_period');

    await queryRunner.dropIndex('review_submissions', 'IDX_review_submissions_approved_by');
    await queryRunner.dropIndex('review_submissions', 'IDX_review_submissions_submitted_by');
    await queryRunner.dropIndex('review_submissions', 'IDX_review_submissions_status');
    await queryRunner.dropIndex('review_submissions', 'IDX_review_submissions_org_period');

    await queryRunner.dropIndex('document_category_grades', 'IDX_document_category_grades_reviewer');
    await queryRunner.dropIndex('document_category_grades', 'IDX_document_category_grades_category');
    await queryRunner.dropIndex('document_category_grades', 'IDX_document_category_grades_org_period');
    await queryRunner.dropIndex('document_category_grades', 'IDX_document_category_grades_org_period_category');

    // Drop tables
    await queryRunner.dropTable('review_history');
    await queryRunner.dropTable('review_submissions');
    await queryRunner.dropTable('document_category_grades');
  }
}
