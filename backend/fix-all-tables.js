const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAllTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log('🔧 Fixing all table column names...');

    // Fix organizations table
    console.log('\n📋 Fixing organizations table...');
    await client.query('DROP TABLE IF EXISTS organizations CASCADE');
    await client.query(`
      CREATE TABLE organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(255),
        state VARCHAR(255),
        zipcode VARCHAR(20),
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(500),
        coordinates JSONB,
        type VARCHAR(100) DEFAULT 'YMCA',
        "parentId" UUID,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Organizations table fixed');

    // Fix performance_calculations table
    console.log('\n📋 Fixing performance_calculations table...');
    await client.query('DROP TABLE IF EXISTS performance_calculations CASCADE');
    await client.query(`
      CREATE TABLE performance_calculations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "organizationId" UUID REFERENCES organizations(id),
        period VARCHAR(50),
        "operationalScore" DECIMAL(5,2),
        "financialScore" DECIMAL(5,2),
        "totalScore" DECIMAL(5,2),
        "supportLevel" VARCHAR(100),
        "memberCount" INTEGER,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Performance calculations table fixed');

    // Fix submissions table
    console.log('\n📋 Fixing submissions table...');
    await client.query('DROP TABLE IF EXISTS submissions CASCADE');
    await client.query(`
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
    `);
    console.log('✅ Submissions table fixed');

    // Fix users table
    console.log('\n📋 Fixing users table...');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        "firstName" VARCHAR(255),
        "lastName" VARCHAR(255),
        role VARCHAR(100) DEFAULT 'user',
        "organizationId" UUID REFERENCES organizations(id),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table fixed');

    await client.end();
    console.log('\n🎉 All tables fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing tables:', error);
    process.exit(1);
  }
}

fixAllTables();
