const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function runMigration() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    console.log('🔄 Running migration: Create Performance Calculations Table...');
    await AppDataSource.runMigrations();
    console.log('✅ Migration completed successfully');

    // Verify the table was created
    const tableExists = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'performance_calculations'
      );
    `);

    if (tableExists[0].exists) {
      console.log('✅ performance_calculations table exists');
      
      // Check if submissionId column exists
      const columnExists = await AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'performance_calculations' 
          AND column_name = 'submissionId'
        );
      `);

      if (columnExists[0].exists) {
        console.log('✅ submissionId column exists');
      } else {
        console.log('❌ submissionId column is missing');
      }
    } else {
      console.log('❌ performance_calculations table does not exist');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

runMigration();
