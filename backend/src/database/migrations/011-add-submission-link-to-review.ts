import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubmissionLinkToReview1705000000011 implements MigrationInterface {
  name = 'AddSubmissionLinkToReview1705000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add submissionId column to review_submissions table
    await queryRunner.addColumn('review_submissions', new TableColumn({
      name: 'submissionId',
      type: 'uuid',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove submissionId column from review_submissions table
    await queryRunner.dropColumn('review_submissions', 'submissionId');
  }
}
