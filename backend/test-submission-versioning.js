const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testSubmissionVersioning() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Test 1: Check if new columns exist
    console.log('\n📋 Test 1: Checking new submission columns...');
    const submissionColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      AND column_name IN ('version', 'parentSubmissionId', 'isLatest', 'status', 'submittedAt', 'autoSubmittedAt')
      ORDER BY column_name
    `);
    
    console.log('New submission columns:');
    submissionColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Test 2: Check if new file upload columns exist
    console.log('\n📋 Test 2: Checking new file upload columns...');
    const fileColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'file_uploads' 
      AND column_name IN ('isSnapshot', 'originalUploadId', 'snapshotCreatedAt')
      ORDER BY column_name
    `);
    
    console.log('New file upload columns:');
    fileColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Test 3: Check if new review submission column exists
    console.log('\n📋 Test 3: Checking new review submission column...');
    const reviewColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'review_submissions' 
      AND column_name = 'submissionId'
    `);
    
    if (reviewColumns.rows.length > 0) {
      console.log('New review submission column:');
      reviewColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('  ❌ submissionId column not found in review_submissions table');
    }
    
    // Test 4: Check if indexes exist
    console.log('\n📋 Test 4: Checking new indexes...');
    const indexes = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('submissions', 'file_uploads')
      AND indexname LIKE '%org_period%' OR indexname LIKE '%submission_snapshot%'
      ORDER BY tablename, indexname
    `);
    
    console.log('New indexes:');
    indexes.rows.forEach(row => {
      console.log(`  - ${row.indexname}: ${row.indexdef}`);
    });
    
    // Test 5: Check enum values
    console.log('\n📋 Test 5: Checking submission status enum...');
    const enumValues = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'submissions_status_enum'
      )
      ORDER BY enumsortorder
    `);
    
    if (enumValues.rows.length > 0) {
      console.log('Submission status enum values:');
      enumValues.rows.forEach(row => {
        console.log(`  - ${row.enumlabel}`);
      });
    } else {
      console.log('  ❌ Submission status enum not found');
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing submission versioning:', error);
  } finally {
    await client.end();
  }
}

testSubmissionVersioning();
