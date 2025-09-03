const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function debugSubmissions() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Check all submissions
    console.log('\n🔍 All submissions in database:');
    const allSubmissions = await AppDataSource.query(`
      SELECT id, "organizationId", "periodId", "createdAt", "completed"
      FROM submissions
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);
    
    console.table(allSubmissions);
    
    // Check specific organization
    const orgId = 'f357cb0b-b881-4166-8516-1c0783d4a5a2';
    console.log(`\n🔍 Submissions for organization ${orgId}:`);
    
    const orgSubmissions = await AppDataSource.query(`
      SELECT id, "organizationId", "periodId", "createdAt", "completed"
      FROM submissions
      WHERE "organizationId" = $1
      ORDER BY "createdAt" DESC
    `, [orgId]);
    
    console.table(orgSubmissions);
    
    // Check data types
    console.log('\n🔍 Column data types:');
    const columnInfo = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'submissions' AND column_name = 'organizationId'
    `);
    
    console.table(columnInfo);
    
    // Check if there are any submissions with different organizationId format
    console.log('\n🔍 All unique organizationIds:');
    const uniqueOrgs = await AppDataSource.query(`
      SELECT DISTINCT "organizationId", COUNT(*) as count
      FROM submissions
      GROUP BY "organizationId"
      ORDER BY count DESC
    `);
    
    console.table(uniqueOrgs);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
}

debugSubmissions();
