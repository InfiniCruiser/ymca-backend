const { DataSource } = require('typeorm');
const { Organization } = require('../dist/backend/src/organizations/entities/organization.entity.js');
const { Submission } = require('../dist/backend/src/submissions/entities/submission.entity.js');
const { PerformanceCalculation } = require('../dist/backend/src/performance/entities/performance-calculation.entity.js');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'ymca_portal',
  entities: [Organization, Submission, PerformanceCalculation],
  synchronize: false,
});

async function cleanupDatabase() {
  try {
    await dataSource.initialize();
    console.log('🔌 Connected to database');

    // Delete performance calculations first (due to foreign key constraints)
    console.log('📊 Deleting performance calculations...');
    const performanceRepo = dataSource.getRepository(PerformanceCalculation);
    const performanceCount = await performanceRepo.count();
    if (performanceCount > 0) {
      await performanceRepo.delete({});
    }
    console.log(`✅ Deleted ${performanceCount} performance calculations`);

    // Delete submissions
    console.log('📝 Deleting submissions...');
    const submissionRepo = dataSource.getRepository(Submission);
    const submissionCount = await submissionRepo.count();
    if (submissionCount > 0) {
      // Delete all submissions by using a condition that matches all records
      await submissionRepo.createQueryBuilder()
        .delete()
        .from(Submission)
        .execute();
    }
    console.log(`✅ Deleted ${submissionCount} submissions`);

    // Verify organizations are still there
    const orgRepo = dataSource.getRepository(Organization);
    const orgCount = await orgRepo.count();
    console.log(`🏢 Organizations remaining: ${orgCount}`);

    console.log('🎉 Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await dataSource.destroy();
  }
}

cleanupDatabase();
