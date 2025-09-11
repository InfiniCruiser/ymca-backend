const { DataSource } = require('typeorm');

async function runDraftMigration() {
  try {
    console.log('🔄 Running draft uniqueness constraint migration...');
    
    // Create a simple data source for the migration
    const dataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [],
      migrations: [],
    });

    await dataSource.initialize();
    console.log('✅ Data source initialized');

    // Run the essential migration directly
    await dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ux_draft_active_tuple"
      ON "submissions" ("organizationId", "submittedBy", "periodId")
      WHERE status = 'DRAFT';
    `);

    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS "ix_draft_tuple"
      ON "submissions" ("organizationId", "submittedBy", "periodId");
    `);

    console.log('✅ Draft uniqueness constraint migration completed successfully');
    
    await dataSource.destroy();
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runDraftMigration();
