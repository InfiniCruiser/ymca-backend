const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function checkDatabaseSchema() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // List all tables
    console.log('\n📋 All tables in database:');
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Check if performance_calculations table exists
    console.log('\n🔍 Checking performance_calculations table...');
    const performanceTable = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'performance_calculations'
      );
    `);

    if (performanceTable[0].exists) {
      console.log('✅ performance_calculations table exists');
      
      // Check columns
      const columns = await AppDataSource.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'performance_calculations' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Columns in performance_calculations:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check if submissionId column exists
      const submissionIdExists = columns.some(col => col.column_name === 'submissionId');
      if (submissionIdExists) {
        console.log('✅ submissionId column exists');
      } else {
        console.log('❌ submissionId column is missing - this is the problem!');
      }
    } else {
      console.log('❌ performance_calculations table does not exist - this is the problem!');
    }

    // Check organizations table
    console.log('\n🔍 Checking organizations table...');
    const orgTable = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations'
      );
    `);

    if (orgTable[0].exists) {
      console.log('✅ organizations table exists');
      
      // Check if it has the required columns
      const orgColumns = await AppDataSource.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'organizations' 
        AND column_name IN ('id', 'name', 'code', 'associationNumber')
        ORDER BY column_name
      `);
      
      console.log('📋 Key columns in organizations:');
      orgColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ organizations table does not exist');
    }

    // Check submissions table
    console.log('\n🔍 Checking submissions table...');
    const submissionsTable = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'submissions'
      );
    `);

    if (submissionsTable[0].exists) {
      console.log('✅ submissions table exists');
    } else {
      console.log('❌ submissions table does not exist');
    }

  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
}

checkDatabaseSchema();
