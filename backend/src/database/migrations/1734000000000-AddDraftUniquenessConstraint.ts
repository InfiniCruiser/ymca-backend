import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDraftUniquenessConstraint1734000000000 implements MigrationInterface {
    name = 'AddDraftUniquenessConstraint1734000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create unique index for active drafts per (organizationId, submittedBy, periodId)
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "ux_draft_active_tuple" 
            ON "submissions" ("organizationId", "submittedBy", "periodId") 
            WHERE "status" = 'draft'
        `);

        // Create helpful lookup index for tuple queries across all statuses
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "ix_draft_tuple" 
            ON "submissions" ("organizationId", "submittedBy", "periodId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "ux_draft_active_tuple"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "ix_draft_tuple"`);
    }
}
