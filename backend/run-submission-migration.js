const { Client } = require('pg');

async function runSubmissionMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if migrations have already been run
    console.log('\n📋 Checking existing columns...');
    
    const existingSubmissionColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      AND column_name IN ('version', 'parentSubmissionId', 'isLatest', 'status', 'submittedAt', 'autoSubmittedAt')
    `);
    
    const existingFileColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'file_uploads' 
      AND column_name IN ('isSnapshot', 'originalUploadId', 'snapshotCreatedAt')
    `);
    
    const existingReviewColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'review_submissions' 
      AND column_name = 'submissionId'
    `);
    
    console.log(`Found ${existingSubmissionColumns.rows.length} existing submission columns`);
    console.log(`Found ${existingFileColumns.rows.length} existing file upload columns`);
    console.log(`Found ${existingReviewColumns.rows.length} existing review submission columns`);
    
    // Migration 1: Add submission versioning columns
    if (existingSubmissionColumns.rows.length < 6) {
      console.log('\n🔄 Running submission versioning migration...');
      
      // Add version column
      if (!existingSubmissionColumns.rows.find(r => r.column_name === 'version')) {
        await client.query('ALTER TABLE submissions ADD COLUMN version INT DEFAULT 1');
        console.log('✅ Added version column');
      }
      
      // Add parentSubmissionId column
      if (!existingSubmissionColumns.rows.find(r => r.column_name === 'parentSubmissionId')) {
        await client.query('ALTER TABLE submissions ADD COLUMN "parentSubmissionId" UUID');
        console.log('✅ Added parentSubmissionId column');
      }
      
      // Add isLatest column
      if (!existingSubmissionColumns.rows.find(r => r.column_name === 'isLatest')) {
        await client.query('ALTER TABLE submissions ADD COLUMN "isLatest" BOOLEAN DEFAULT true');
        console.log('✅ Added isLatest column');
      }
      
      // Add status enum and column
      if (!existingSubmissionColumns.rows.find(r => r.column_name === 'status')) {
        await client.query(`
          DO $$ BEGIN
            CREATE TYPE submissions_status_enum AS ENUM ('draft', 'submitted', 'locked');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
        await client.query('ALTER TABLE submissions ADD COLUMN status submissions_status_enum DEFAULT \'draft\'');
        console.log('✅ Added status column with enum');
      }
      
      // Add submittedAt column
      if (!existingSubmissionColumns.rows.find(r => r.column_name === 'submittedAt')) {
        await client.query('ALTER TABLE submissions ADD COLUMN "submittedAt" TIMESTAMP');
        console.log('✅ Added submittedAt column');
      }
      
      // Add autoSubmittedAt column
      if (!existingSubmissionColumns.rows.find(r => r.column_name === 'autoSubmittedAt')) {
        await client.query('ALTER TABLE submissions ADD COLUMN "autoSubmittedAt" TIMESTAMP');
        console.log('✅ Added autoSubmittedAt column');
      }
      
      // Update existing submissions
      await client.query(`
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
          END
      `);
      console.log('✅ Updated existing submissions with default values');
    } else {
      console.log('✅ Submission versioning columns already exist');
    }
    
    // Migration 2: Add file upload snapshot columns
    if (existingFileColumns.rows.length < 3) {
      console.log('\n🔄 Running file upload snapshot migration...');
      
      // Add isSnapshot column
      if (!existingFileColumns.rows.find(r => r.column_name === 'isSnapshot')) {
        await client.query('ALTER TABLE file_uploads ADD COLUMN "isSnapshot" BOOLEAN DEFAULT false');
        console.log('✅ Added isSnapshot column');
      }
      
      // Add originalUploadId column
      if (!existingFileColumns.rows.find(r => r.column_name === 'originalUploadId')) {
        await client.query('ALTER TABLE file_uploads ADD COLUMN "originalUploadId" UUID');
        console.log('✅ Added originalUploadId column');
      }
      
      // Add snapshotCreatedAt column
      if (!existingFileColumns.rows.find(r => r.column_name === 'snapshotCreatedAt')) {
        await client.query('ALTER TABLE file_uploads ADD COLUMN "snapshotCreatedAt" TIMESTAMP');
        console.log('✅ Added snapshotCreatedAt column');
      }
    } else {
      console.log('✅ File upload snapshot columns already exist');
    }
    
    // Migration 3: Add review submission link column
    if (existingReviewColumns.rows.length < 1) {
      console.log('\n🔄 Running review submission link migration...');
      
      await client.query('ALTER TABLE review_submissions ADD COLUMN "submissionId" UUID');
      console.log('✅ Added submissionId column to review_submissions');
    } else {
      console.log('✅ Review submission link column already exists');
    }
    
    // Create indexes
    console.log('\n🔄 Creating indexes...');
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS "IDX_submissions_org_period_latest" 
        ON submissions ("organizationId", "periodId", "isLatest")
      `);
      console.log('✅ Created submissions org_period_latest index');
    } catch (e) {
      console.log('ℹ️ Index IDX_submissions_org_period_latest already exists or failed to create');
    }
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS "IDX_submissions_org_period_version" 
        ON submissions ("organizationId", "periodId", version)
      `);
      console.log('✅ Created submissions org_period_version index');
    } catch (e) {
      console.log('ℹ️ Index IDX_submissions_org_period_version already exists or failed to create');
    }
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS "IDX_submissions_status" 
        ON submissions (status)
      `);
      console.log('✅ Created submissions status index');
    } catch (e) {
      console.log('ℹ️ Index IDX_submissions_status already exists or failed to create');
    }
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS "IDX_file_uploads_submission_snapshot" 
        ON file_uploads ("submissionId", "isSnapshot")
      `);
      console.log('✅ Created file_uploads submission_snapshot index');
    } catch (e) {
      console.log('ℹ️ Index IDX_file_uploads_submission_snapshot already exists or failed to create');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Added submission versioning fields');
    console.log('- Added file snapshot fields');
    console.log('- Added review submission linking');
    console.log('- Created performance indexes');
    console.log('- Updated existing data with defaults');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSubmissionMigration();
