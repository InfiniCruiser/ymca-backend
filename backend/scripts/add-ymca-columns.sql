-- Add YMCA-specific columns to the organizations table
-- This script adds all the new columns that were defined in the enhanced Organization entity

-- Add Association Number column
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "associationNumber" character varying;

-- Add YMCA-specific data columns
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "doingBusinessAs" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "facilityType" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "isAssociation" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "isChartered" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "isLearningCenter" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "charterStatus" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "charterDate" date;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "associationBranchCount" integer DEFAULT 0;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "budgetRange" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "crmProvider" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "closedDate" date;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "closureReason" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "completedMergeDate" date;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "latitude" double precision;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "longitude" double precision;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "level" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "memberGroup" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "nwmParticipant" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "learningRegion" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "yStatus" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "yType" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "yessParticipant" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "alliancePartner" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "financeSystem" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "affiliateGroup" character varying;

-- Add Pilot program data columns
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "potentialPilotInvite" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "invited" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "inviteResponse" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "receivedDavidQ" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "participatedInPilot1" boolean DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "notes" text;

-- Add Contact information columns (if they don't exist)
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "ceoName" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "address" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "address1" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "city" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "state" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "zipCode" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "phone" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "fax" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "email" character varying;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "website" character varying;

-- Create unique index on associationNumber
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_organizations_associationNumber" ON "organizations" ("associationNumber");

-- Add comments for documentation
COMMENT ON COLUMN "organizations"."associationNumber" IS 'Unique YMCA association number from CSV';
COMMENT ON COLUMN "organizations"."doingBusinessAs" IS 'Alternative business name';
COMMENT ON COLUMN "organizations"."facilityType" IS 'Type of facility (Facility, Non-Facility, Resident Camp)';
COMMENT ON COLUMN "organizations"."isAssociation" IS 'Whether this is a YMCA association';
COMMENT ON COLUMN "organizations"."isChartered" IS 'Whether the association is chartered';
COMMENT ON COLUMN "organizations"."isLearningCenter" IS 'Whether this is a learning center';
COMMENT ON COLUMN "organizations"."charterStatus" IS 'Charter status of the association';
COMMENT ON COLUMN "organizations"."charterDate" IS 'Date when the association was chartered';
COMMENT ON COLUMN "organizations"."associationBranchCount" IS 'Number of branches in the association';
COMMENT ON COLUMN "organizations"."budgetRange" IS 'Budget range category';
COMMENT ON COLUMN "organizations"."crmProvider" IS 'CRM system provider';
COMMENT ON COLUMN "organizations"."closedDate" IS 'Date when the association closed';
COMMENT ON COLUMN "organizations"."closureReason" IS 'Reason for closure';
COMMENT ON COLUMN "organizations"."completedMergeDate" IS 'Date when merge was completed';
COMMENT ON COLUMN "organizations"."latitude" IS 'Geographic latitude';
COMMENT ON COLUMN "organizations"."longitude" IS 'Geographic longitude';
COMMENT ON COLUMN "organizations"."level" IS 'Association level';
COMMENT ON COLUMN "organizations"."memberGroup" IS 'Member group classification';
COMMENT ON COLUMN "organizations"."nwmParticipant" IS 'Whether participates in NWM';
COMMENT ON COLUMN "organizations"."learningRegion" IS 'Learning region';
COMMENT ON COLUMN "organizations"."yStatus" IS 'Y Status (Open, Closed, Merged)';
COMMENT ON COLUMN "organizations"."yType" IS 'Y Type classification';
COMMENT ON COLUMN "organizations"."yessParticipant" IS 'Whether participates in YESS';
COMMENT ON COLUMN "organizations"."alliancePartner" IS 'Alliance partner information';
COMMENT ON COLUMN "organizations"."financeSystem" IS 'Finance system used';
COMMENT ON COLUMN "organizations"."affiliateGroup" IS 'Affiliate group';
COMMENT ON COLUMN "organizations"."potentialPilotInvite" IS 'Whether invited to pilot program';
COMMENT ON COLUMN "organizations"."invited" IS 'Whether actually invited';
COMMENT ON COLUMN "organizations"."inviteResponse" IS 'Response to pilot invitation';
COMMENT ON COLUMN "organizations"."receivedDavidQ" IS 'Whether received David Q';
COMMENT ON COLUMN "organizations"."participatedInPilot1" IS 'Whether participated in Pilot 1.0';
COMMENT ON COLUMN "organizations"."notes" IS 'Additional notes';
