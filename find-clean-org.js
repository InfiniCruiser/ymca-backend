const { AppDataSource } = require('./backend/dist/backend/src/database/data-source.js');

async function findCleanOrg() {
  try {
    // Force Heroku database connection
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://your-heroku-db-url';
    
    await AppDataSource.initialize();
    console.log('✅ Heroku Database connected');
    
    // Find organizations that have NO active submissions (OPEN or LOCKED status)
    const cleanOrgs = await AppDataSource.query(`
      SELECT 
        o.id,
        o.name,
        COUNT(s.id) as total_submissions,
        COUNT(CASE WHEN s.status IN ('open', 'locked') THEN 1 END) as active_submissions
      FROM organizations o
      LEFT JOIN submissions s ON o.id = s."organizationId" AND s."periodId" = '2025-Q3'
      GROUP BY o.id, o.name
      HAVING COUNT(CASE WHEN s.status IN ('open', 'locked') THEN 1 END) = 0
      ORDER BY total_submissions ASC
      LIMIT 10
    `);
    
    console.log('\n🧹 Organizations with NO active submissions for 2025-Q3:');
    console.table(cleanOrgs);
    
    if (cleanOrgs.length > 0) {
      console.log('\n✅ Recommended for testing:');
      console.log(`Organization ID: ${cleanOrgs[0].id}`);
      console.log(`Organization Name: ${cleanOrgs[0].name}`);
      console.log(`Total submissions: ${cleanOrgs[0].total_submissions}`);
    } else {
      console.log('\n🔍 No completely clean orgs found. Checking orgs with minimal activity...');
      
      // Find organizations with minimal submissions
      const minimalOrgs = await AppDataSource.query(`
        SELECT 
          o.id,
          o.name,
          COUNT(s.id) as total_submissions,
          COUNT(CASE WHEN s.status IN ('open', 'locked') THEN 1 END) as active_submissions,
          MAX(s."createdAt") as last_submission
        FROM organizations o
        LEFT JOIN submissions s ON o.id = s."organizationId" AND s."periodId" = '2025-Q3'
        GROUP BY o.id, o.name
        HAVING COUNT(CASE WHEN s.status IN ('open', 'locked') THEN 1 END) = 0
        ORDER BY total_submissions ASC, last_submission ASC
        LIMIT 5
      `);
      
      if (minimalOrgs.length > 0) {
        console.log('\n📊 Organizations with minimal activity:');
        console.table(minimalOrgs);
        console.log('\n✅ Recommended for testing:');
        console.log(`Organization ID: ${minimalOrgs[0].id}`);
        console.log(`Organization Name: ${minimalOrgs[0].name}`);
      } else {
        console.log('\n❌ No suitable organizations found. All have active submissions.');
      }
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

findCleanOrg();
