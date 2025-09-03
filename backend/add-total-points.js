const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function addTotalPoints() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Add totalPoints column
    console.log('➕ Adding totalPoints column...');
    await AppDataSource.query(`
      ALTER TABLE "performance_calculations" 
      ADD COLUMN "totalPoints" numeric(5,2)
    `);
    console.log('✅ Added totalPoints column');

    // Update existing records to calculate totalPoints from totalScore
    console.log('🔄 Updating existing records...');
    await AppDataSource.query(`
      UPDATE "performance_calculations" 
      SET "totalPoints" = "totalScore" 
      WHERE "totalPoints" IS NULL AND "totalScore" IS NOT NULL
    `);
    console.log('✅ Updated existing records');

    console.log('🎯 totalPoints column added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

addTotalPoints();
