-- Submission Versioning Migration
-- Run this SQL on your deployed database

-- 1. Add submission versioning columns
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "parentSubmissionId" UUID;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "isLatest" BOOLEAN DEFAULT true;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "autoSubmittedAt" TIMESTAMP;

-- 2. Create status enum and add column
DO $$ BEGIN
    CREATE TYPE submissions_status_enum AS ENUM ('draft', 'submitted', 'locked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status submissions_status_enum DEFAULT 'draft';

-- 3. Add file upload snapshot columns
ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS "isSnapshot" BOOLEAN DEFAULT false;
ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS "originalUploadId" UUID;
ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS "snapshotCreatedAt" TIMESTAMP;

-- 4. Add review submission link column
ALTER TABLE review_submissions ADD COLUMN IF NOT EXISTS "submissionId" UUID;

-- 5. Update existing submissions with default values
UPDATE submissions 
SET 
    version = 1,
    "isLatest" = true,
    status = CASE 
        WHEN completed = true THEN 'submitted'
        ELSE 'draft'
    END,
    "submittedAt" = CASE 
        WHEN completed = true THEN "updatedAt"
        ELSE NULL
    END;

-- 6. Create performance indexes
CREATE INDEX IF NOT EXISTS "IDX_submissions_org_period_latest" 
ON submissions ("organizationId", "periodId", "isLatest");

CREATE INDEX IF NOT EXISTS "IDX_submissions_org_period_version" 
ON submissions ("organizationId", "periodId", version);

CREATE INDEX IF NOT EXISTS "IDX_submissions_status" 
ON submissions (status);

CREATE INDEX IF NOT EXISTS "IDX_file_uploads_submission_snapshot" 
ON file_uploads ("submissionId", "isSnapshot");

-- 7. Verify the migration
SELECT 
    'submissions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND column_name IN ('version', 'parentSubmissionId', 'isLatest', 'status', 'submittedAt', 'autoSubmittedAt')
ORDER BY column_name;

SELECT 
    'file_uploads' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'file_uploads' 
AND column_name IN ('isSnapshot', 'originalUploadId', 'snapshotCreatedAt')
ORDER BY column_name;

SELECT 
    'review_submissions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'review_submissions' 
AND column_name = 'submissionId';
