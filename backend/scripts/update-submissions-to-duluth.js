const { Client } = require('pg');

// Database configuration
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ymca_portal',
});

const DULUTH_YMCA_ID = 'f357cb0b-b881-4166-8516-1c0783d4a5a2';

async function updateSubmissionsToDuluth() {
  try {
    await client.connect();
    console.log('✅ Database connection established');

    // Get all submissions
    const submissionsResult = await client.query(`
      SELECT id, "organizationId", "createdAt", "updatedAt" 
      FROM submissions 
      ORDER BY "createdAt" DESC
    `);

    console.log(`📊 Found ${submissionsResult.rows.length} submissions to update`);

    if (submissionsResult.rows.length === 0) {
      console.log('ℹ️ No submissions found to update');
      return;
    }

    // Update all submissions to use Duluth YMCA ID
    const result = await client.query(`
      UPDATE submissions 
      SET "organizationId" = $1, "updatedAt" = CURRENT_TIMESTAMP 
      WHERE "organizationId" IS NULL OR "organizationId" != $1
    `, [DULUTH_YMCA_ID]);

    console.log(`✅ Updated ${result.rowCount || 0} submissions to use Duluth Area Family YMCA`);

    // Verify the update
    const updatedSubmissions = await client.query(`
      SELECT COUNT(*) as count 
      FROM submissions 
      WHERE "organizationId" = $1
    `, [DULUTH_YMCA_ID]);

    console.log(`📊 Total submissions now associated with Duluth YMCA: ${updatedSubmissions.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error updating submissions:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
updateSubmissionsToDuluth()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
