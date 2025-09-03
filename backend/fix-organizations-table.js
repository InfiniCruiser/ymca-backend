const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function fixOrganizationsTable() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Drop existing table if it exists
    console.log('🗑️ Dropping existing organizations table...');
    await AppDataSource.query('DROP TABLE IF EXISTS organizations CASCADE');
    
    // Create organizations table with proper structure
    console.log('🏗️ Creating organizations table...');
    await AppDataSource.query(`
      CREATE TABLE organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100),
        type VARCHAR(50),
        "parentId" UUID,
        settings JSONB,
        address VARCHAR(500),
        city VARCHAR(100),
        state VARCHAR(50),
        "zipCode" VARCHAR(20),
        phone VARCHAR(50),
        website VARCHAR(500),
        "isActive" BOOLEAN DEFAULT true,
        "lastActiveAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "isAssociation" BOOLEAN DEFAULT false,
        "isChartered" BOOLEAN DEFAULT false,
        "isLearningCenter" BOOLEAN DEFAULT false,
        "charterDate" DATE,
        "associationBranchCount" INTEGER,
        "closedDate" DATE,
        "completedMergeDate" DATE,
        "nwmParticipant" BOOLEAN DEFAULT false,
        "yessParticipant" BOOLEAN DEFAULT false,
        "potentialPilotInvite" BOOLEAN DEFAULT false,
        invited BOOLEAN DEFAULT false,
        "receivedDavidQ" BOOLEAN DEFAULT false,
        "participatedInPilot1" BOOLEAN DEFAULT false,
        notes TEXT,
        "associationNumber" VARCHAR(50),
        "doingBusinessAs" VARCHAR(255),
        "facilityType" VARCHAR(100),
        "charterStatus" VARCHAR(100),
        "budgetRange" VARCHAR(100),
        "crmProvider" VARCHAR(100),
        "closureReason" TEXT,
        latitude DECIMAL(10,7),
        longitude DECIMAL(10,7),
        level VARCHAR(100),
        "memberGroup" VARCHAR(100),
        "learningRegion" VARCHAR(100),
        "yStatus" VARCHAR(50),
        "yType" VARCHAR(100),
        "alliancePartner" VARCHAR(255),
        "financeSystem" VARCHAR(100),
        "affiliateGroup" VARCHAR(100),
        "inviteResponse" VARCHAR(100),
        "ceoName" VARCHAR(255),
        address1 VARCHAR(500),
        fax VARCHAR(50),
        email VARCHAR(255)
      )
    `);
    
    console.log('✅ Organizations table created successfully!');
    console.log('📥 Now you can import your SQL data');
    
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

fixOrganizationsTable();
