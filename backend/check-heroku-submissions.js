const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function checkHerokuSubmissions() {
  try {
    // Force Heroku database connection
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://your-heroku-db-url';
    
    await AppDataSource.initialize();
    console.log('✅ Heroku Database connected');
    
    // Check submissions count
    const submissionsCount = await AppDataSource.query(`
      SELECT COUNT(*) as total_submissions
      FROM submissions
    `);
    
    console.log(`📊 Total submissions in Heroku DB: ${submissionsCount[0].total_submissions}`);
    
    // Check organization submissions
    const orgId = 'f357cb0b-b881-4166-8516-8516-1c0783d4a5a2';
    const orgSubmissions = await AppDataSource.query(`
      SELECT COUNT(*) as org_submissions
      FROM submissions
      WHERE "organizationId" = $1
    `, [orgId]);
    
    console.log(`🏢 Submissions for organization ${orgId}: ${orgSubmissions[0].org_submissions}`);
    
    // Check recent submissions
    const recentSubmissions = await AppDataSource.query(`
      SELECT id, "organizationId", "periodId", "createdAt", "completed"
      FROM submissions
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);
    
    console.log('\n🔍 Recent submissions:');
    console.table(recentSubmissions);
    
    // Check if the new submission we saw in logs exists
    console.log('\n🔍 Checking for recent submission...');
    const newSubmission = await AppDataSource.query(`
      SELECT id, "organizationId", "periodId", "createdAt", "completed"
      FROM submissions
      WHERE "createdAt" > NOW() - INTERVAL '1 hour'
      ORDER BY "createdAt" DESC
    `);
    
    if (newSubmission.length > 0) {
      console.log('✅ Found recent submission:');
      console.table(newSubmission);
    } else {
      console.log('❌ No recent submissions found');
    }
    
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

checkHerokuSubmissions();
