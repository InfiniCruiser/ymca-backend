const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixCompleteSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log('🔧 Creating complete organizations table schema...');

    console.log('📋 Dropping existing organizations table...');
    await client.query('DROP TABLE IF EXISTS organizations CASCADE');
    
    console.log('📋 Creating complete organizations table...');
    const createTableQuery = `
      CREATE TABLE organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        "associationNumber" VARCHAR(10),
        type VARCHAR(50) DEFAULT 'LOCAL_Y',
        "parentId" UUID,
        "doingBusinessAs" VARCHAR(255),
        "facilityType" VARCHAR(100),
        "isAssociation" BOOLEAN DEFAULT true,
        "isChartered" BOOLEAN DEFAULT true,
        "isLearningCenter" BOOLEAN DEFAULT false,
        "charterStatus" VARCHAR(50),
        "charterDate" DATE,
        "associationBranchCount" INTEGER DEFAULT 0,
        "budgetRange" VARCHAR(100),
        "crmProvider" VARCHAR(100),
        "closedDate" DATE,
        "closureReason" TEXT,
        "completedMergeDate" DATE,
        latitude DECIMAL(10,6),
        longitude DECIMAL(10,6),
        level VARCHAR(100),
        "memberGroup" VARCHAR(100),
        "nwmParticipant" BOOLEAN DEFAULT false,
        "learningRegion" VARCHAR(100),
        "yStatus" VARCHAR(50) DEFAULT 'Open',
        "yType" VARCHAR(100),
        "yessParticipant" BOOLEAN DEFAULT false,
        "alliancePartner" VARCHAR(255),
        "financeSystem" VARCHAR(100),
        "affiliateGroup" VARCHAR(50),
        "potentialPilotInvite" BOOLEAN DEFAULT false,
        invited BOOLEAN DEFAULT false,
        "inviteResponse" VARCHAR(50),
        "receivedDavidQ" BOOLEAN DEFAULT false,
        "participatedInPilot1" BOOLEAN DEFAULT false,
        notes TEXT,
        "ceoName" VARCHAR(255),
        address TEXT,
        "address1" VARCHAR(255),
        city VARCHAR(255),
        state VARCHAR(2),
        "zipCode" VARCHAR(10),
        phone VARCHAR(20),
        fax VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        coordinates JSONB,
        settings JSONB DEFAULT '{}',
        "isActive" BOOLEAN DEFAULT true,
        "lastActiveAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTableQuery);
    console.log('✅ Complete organizations table created');

    const columnsResult = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Complete organizations table columns:');
    columnsResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name}`);
    });

    console.log(`\n🎉 Total columns: ${columnsResult.rows.length}`);

    await client.end();
    console.log('\n✅ Complete schema created successfully!');

  } catch (error) {
    console.error('❌ Error creating complete schema:', error);
    process.exit(1);
  }
}

fixCompleteSchema();
