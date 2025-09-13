import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceOrganizationsWithYMCAData1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add YMCA-specific enums
    await queryRunner.query(`
      CREATE TYPE "public"."ymca_status_enum" AS ENUM('Open', 'Closed', 'Merged')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "public"."ymca_type_enum" AS ENUM('Corporate Association', 'Independent Camp or Conference Center')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "public"."facility_type_enum" AS ENUM('Facility', 'Non-Facility', 'Resident Camp')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "public"."budget_range_enum" AS ENUM('Under $650,000', '$650,001-$1,000,000', '$1,000,001-$2,000,000', '$2,000,001-$4,000,000', '$4,000,001-$14,000,000', 'Over $14,000,000')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "public"."member_group_enum" AS ENUM('Small & Mid Size', 'Mid-Major', 'YNAN')
    `);

    // Add YMCA association fields
    await queryRunner.query(`
      ALTER TABLE "organizations" 
      ADD COLUMN "associationNumber" character varying(10),
      ADD COLUMN "doingBusinessAs" character varying(255),
      ADD COLUMN "facilityType" "public"."facility_type_enum",
      ADD COLUMN "isAssociation" boolean NOT NULL DEFAULT true,
      ADD COLUMN "isChartered" boolean NOT NULL DEFAULT true,
      ADD COLUMN "isLearningCenter" boolean NOT NULL DEFAULT false,
      ADD COLUMN "charterStatus" character varying(50),
      ADD COLUMN "charterDate" date,
      ADD COLUMN "associationBranchCount" integer NOT NULL DEFAULT 0,
      ADD COLUMN "budgetRange" "public"."budget_range_enum",
      ADD COLUMN "crmProvider" character varying(100),
      ADD COLUMN "closedDate" date,
      ADD COLUMN "closureReason" text,
      ADD COLUMN "completedMergeDate" date,
      ADD COLUMN "latitude" decimal(10,6),
      ADD COLUMN "longitude" decimal(10,6),
      ADD COLUMN "level" character varying(100),
      ADD COLUMN "memberGroup" "public"."member_group_enum",
      ADD COLUMN "nwmParticipant" boolean NOT NULL DEFAULT false,
      ADD COLUMN "learningRegion" character varying(100),
      ADD COLUMN "yStatus" "public"."ymca_status_enum" DEFAULT 'Open',
      ADD COLUMN "yType" "public"."ymca_type_enum",
      ADD COLUMN "yessParticipant" boolean NOT NULL DEFAULT false,
      ADD COLUMN "alliancePartner" character varying(255),
      ADD COLUMN "financeSystem" character varying(100),
      ADD COLUMN "affiliateGroup" character varying(50),
      ADD COLUMN "potentialPilotInvite" boolean NOT NULL DEFAULT false,
      ADD COLUMN "invited" boolean NOT NULL DEFAULT false,
      ADD COLUMN "inviteResponse" character varying(50),
      ADD COLUMN "receivedDavidQ" boolean NOT NULL DEFAULT false,
      ADD COLUMN "participatedInPilot1" boolean NOT NULL DEFAULT false,
      ADD COLUMN "notes" text,
      ADD COLUMN "ceoName" character varying(255),
      ADD COLUMN "address1" character varying(255),
      ADD COLUMN "fax" character varying(20)
    `);

    // Add unique index for association number
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_organizations_association_number" ON "organizations" ("associationNumber")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique index
    await queryRunner.query(`DROP INDEX "IDX_organizations_association_number"`);

    // Drop the columns
    await queryRunner.query(`
      ALTER TABLE "organizations" 
      DROP COLUMN "associationNumber",
      DROP COLUMN "doingBusinessAs",
      DROP COLUMN "facilityType",
      DROP COLUMN "isAssociation",
      DROP COLUMN "isChartered",
      DROP COLUMN "isLearningCenter",
      DROP COLUMN "charterStatus",
      DROP COLUMN "charterDate",
      DROP COLUMN "associationBranchCount",
      DROP COLUMN "budgetRange",
      DROP COLUMN "crmProvider",
      DROP COLUMN "closedDate",
      DROP COLUMN "closureReason",
      DROP COLUMN "completedMergeDate",
      DROP COLUMN "latitude",
      DROP COLUMN "longitude",
      DROP COLUMN "level",
      DROP COLUMN "memberGroup",
      DROP COLUMN "nwmParticipant",
      DROP COLUMN "learningRegion",
      DROP COLUMN "yStatus",
      DROP COLUMN "yType",
      DROP COLUMN "yessParticipant",
      DROP COLUMN "alliancePartner",
      DROP COLUMN "financeSystem",
      DROP COLUMN "affiliateGroup",
      DROP COLUMN "potentialPilotInvite",
      DROP COLUMN "invited",
      DROP COLUMN "inviteResponse",
      DROP COLUMN "receivedDavidQ",
      DROP COLUMN "participatedInPilot1",
      DROP COLUMN "notes",
      DROP COLUMN "ceoName",
      DROP COLUMN "address1",
      DROP COLUMN "fax"
    `);

    // Drop the enums
    await queryRunner.query(`DROP TYPE "public"."member_group_enum"`);
    await queryRunner.query(`DROP TYPE "public"."budget_range_enum"`);
    await queryRunner.query(`DROP TYPE "public"."facility_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ymca_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ymca_status_enum"`);
  }
}
