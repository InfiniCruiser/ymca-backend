const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function checkOrgStructure() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Check organizations table structure
    const columns = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Organizations table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Check current organizations count
    const count = await AppDataSource.query(`
      SELECT COUNT(*) as count FROM organizations
    `);
    
    console.log(`\n📊 Current organizations count: ${count[0].count}`);
    
    // Show a sample organization if any exist
    if (count[0].count > 0) {
      const sample = await AppDataSource.query(`
        SELECT * FROM organizations LIMIT 1
      `);
      console.log('\n🔍 Sample organization:');
      console.log(JSON.stringify(sample[0], null, 2));
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

checkOrgStructure();
