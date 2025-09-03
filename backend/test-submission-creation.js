const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function testSubmissionCreation() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Check current submissions count
    const beforeCount = await AppDataSource.query('SELECT COUNT(*) as count FROM submissions');
    console.log(`📊 Submissions before test: ${beforeCount[0].count}`);
    
    // Try to create a simple submission
    console.log('➕ Creating test submission...');
    const testSubmission = {
      id: 'test-' + Date.now(),
      periodId: 'test_period_' + Date.now(),
      totalQuestions: 10,
      responses: { test: 'data' },
      completed: true,
      submittedBy: 'test_user',
      organizationId: 'f357cb0b-b881-4166-8516-1c0783d4a5a2',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await AppDataSource.query(`
      INSERT INTO submissions (id, "periodId", "totalQuestions", responses, completed, "submittedBy", "organizationId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      testSubmission.id,
      testSubmission.periodId,
      testSubmission.totalQuestions,
      JSON.stringify(testSubmission.responses),
      testSubmission.completed,
      testSubmission.submittedBy,
      testSubmission.organizationId,
      testSubmission.createdAt,
      testSubmission.updatedAt
    ]);
    
    console.log('✅ Test submission created:', result[0].id);
    
    // Check submissions count after
    const afterCount = await AppDataSource.query('SELECT COUNT(*) as count FROM submissions');
    console.log(`📊 Submissions after test: ${afterCount[0].count}`);
    
    // Verify the submission exists
    const savedSubmission = await AppDataSource.query(`
      SELECT * FROM submissions WHERE id = $1
    `, [testSubmission.id]);
    
    if (savedSubmission.length > 0) {
      console.log('✅ Submission verified in database');
      console.log('📋 Submission data:', {
        id: savedSubmission[0].id,
        organizationId: savedSubmission[0].organizationId,
        periodId: savedSubmission[0].periodId,
        createdAt: savedSubmission[0].createdAt
      });
    } else {
      console.log('❌ Submission not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
}

testSubmissionCreation();
