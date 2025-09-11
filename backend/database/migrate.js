const { MigrationDataSource } = require('./dist/backend/src/database/migration-data-source');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Initialize the data source
    await MigrationDataSource.initialize();
    console.log('✅ Data source initialized');
    
    // Run pending migrations
    const migrations = await MigrationDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('✅ No pending migrations found');
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach(migration => {
        console.log(`  - ${migration.name}`);
      });
    }
    
    // Close the data source
    await MigrationDataSource.destroy();
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
