const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function fixMissingOrgId() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Check current submission
    const submission = await AppDataSource.query(`
      SELECT * FROM submissions WHERE id = $1
    `, ['bbb0c868-f34c-4952-892e-c5fbf0bd90d6']);
    
    if (submission.length === 0) {
      console.log('❌ Submission not found');
      return;
    }
    
    console.log('📋 Current submission data:');
    console.log('ID:', submission[0].id);
    console.log('Organization ID:', submission[0].organizationId);
    console.log('Period ID:', submission[0].periodId);
    
    // Fix the missing organizationId
    if (!submission[0].organizationId) {
      console.log('🔧 Fixing missing organizationId...');
      
      await AppDataSource.query(`
        UPDATE submissions 
        SET "organizationId" = $1, "updatedAt" = NOW()
        WHERE id = $2
      `, ['f357cb0b-b881-4166-8516-1c0783d4a5a2', 'bbb0c868-f34c-4952-892e-c5fbf0bd90d6']);
      
      console.log('✅ Organization ID updated');
      
      // Verify the fix
      const updatedSubmission = await AppDataSource.query(`
        SELECT * FROM submissions WHERE id = $1
      `, ['bbb0c868-f34c-4952-892e-c5fbf0bd90d6']);
      
      console.log('📋 Updated submission data:');
      console.log('ID:', updatedSubmission[0].id);
      console.log('Organization ID:', updatedSubmission[0].organizationId);
      console.log('Period ID:', updatedSubmission[0].periodId);
      
    } else {
      console.log('✅ Organization ID already set');
    }
    
    // Test the dashboard query
    console.log('\n🧪 Testing dashboard query...');
    const orgSubmissions = await AppDataSource.query(`
      SELECT COUNT(*) as count FROM submissions 
      WHERE "organizationId" = $1
    `, ['f357cb0b-b881-4166-8516-8516-1c0783d4a5a2']);
    
    console.log(`📊 Submissions for organization: ${orgSubmissions[0].count}`);
    
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

fixMissingOrgId();
