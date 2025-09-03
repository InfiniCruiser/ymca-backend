const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixSubmissionsTable() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log('🔧 Fixing submissions table column names...');

    console.log('📋 Step 1: Dropping existing submissions table...');
    await client.query('DROP TABLE IF EXISTS submissions CASCADE');
    console.log('✅ Dropped existing submissions table');

    console.log('📋 Step 2: Recreating submissions table with proper column names...');
    const createTableQuery = `
      CREATE TABLE submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "periodId" UUID,
        "totalQuestions" INTEGER,
        responses JSONB,
        completed BOOLEAN DEFAULT false,
        "submittedBy" UUID,
        "organizationId" UUID REFERENCES organizations(id),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTableQuery);
    console.log('✅ Recreated submissions table with proper column names');

    console.log('📋 Step 3: Verifying new table structure...');
    const columnsResult = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 New submissions table columns:');
    columnsResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name}`);
    });

    await client.end();
    console.log('\n✅ Submissions table fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing submissions table:', error);
    process.exit(1);
  }
}

fixSubmissionsTable();
