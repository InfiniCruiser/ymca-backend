import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateFileUploadsTable1704067200000 implements MigrationInterface {
  name = 'CreateFileUploadsTable1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create file_uploads table
    await queryRunner.createTable(
      new Table({
        name: 'file_uploads',
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
            name: 'userId',
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
            name: 'uploadType',
            type: 'enum',
            enum: ['main', 'secondary'],
            default: "'main'",
            isNullable: false,
          },
          {
            name: 'uploadId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'files',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'submissionId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'uploadedAt',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'NOW()',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indexes using raw SQL
    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_organization_period" 
      ON "file_uploads" ("organizationId", "periodId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_category" 
      ON "file_uploads" ("categoryId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_uploaded_at" 
      ON "file_uploads" ("uploadedAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_user" 
      ON "file_uploads" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_upload_id" 
      ON "file_uploads" ("uploadId")
    `);

    // Create foreign key constraints using raw SQL
    await queryRunner.query(`
      ALTER TABLE "file_uploads" 
      ADD CONSTRAINT "FK_file_uploads_organization" 
      FOREIGN KEY ("organizationId") 
      REFERENCES "organizations"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "file_uploads" 
      ADD CONSTRAINT "FK_file_uploads_user" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "file_uploads" 
      ADD CONSTRAINT "FK_file_uploads_submission" 
      FOREIGN KEY ("submissionId") 
      REFERENCES "submissions"("id") 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "file_uploads" 
      DROP CONSTRAINT IF EXISTS "FK_file_uploads_organization"
    `);

    await queryRunner.query(`
      ALTER TABLE "file_uploads" 
      DROP CONSTRAINT IF EXISTS "FK_file_uploads_user"
    `);

    await queryRunner.query(`
      ALTER TABLE "file_uploads" 
      DROP CONSTRAINT IF EXISTS "FK_file_uploads_submission"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_file_uploads_organization_period"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_file_uploads_category"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_file_uploads_uploaded_at"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_file_uploads_user"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_file_uploads_upload_id"
    `);

    // Drop table
    await queryRunner.dropTable('file_uploads');
  }
}