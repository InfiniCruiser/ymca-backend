const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function syncOrganizations() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Get all organizations from local database
    const localOrgs = await AppDataSource.query(`
      SELECT * FROM organizations 
      ORDER BY name
    `);
    
    console.log(`📊 Found ${localOrgs.length} organizations in local database`);
    
    // Check what's already in Heroku database
    const herokuOrgs = await AppDataSource.query(`
      SELECT COUNT(*) as count FROM organizations
    `);
    
    console.log(`🌐 Heroku database currently has ${herokuOrgs[0].count} organizations`);
    
    if (localOrgs.length === 0) {
      console.log('❌ No organizations found in local database');
      return;
    }
    
    // Sync each organization
    let synced = 0;
    let errors = 0;
    
    for (const org of localOrgs) {
      try {
        // Check if organization already exists
        const existing = await AppDataSource.query(`
          SELECT id FROM organizations WHERE id = $1
        `, [org.id]);
        
        if (existing.length > 0) {
          // Update existing
          await AppDataSource.query(`
            UPDATE organizations SET
              name = $1,
              code = $2,
              "associationNumber" = $3,
              "updatedAt" = NOW()
            WHERE id = $4
          `, [org.name, org.code, org.associationNumber, org.id]);
          console.log(`🔄 Updated: ${org.name}`);
        } else {
          // Insert new
          await AppDataSource.query(`
            INSERT INTO organizations (
              id, name, code, "associationNumber", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
          `, [org.id, org.name, org.code, org.associationNumber]);
          console.log(`➕ Added: ${org.name}`);
        }
        
        synced++;
      } catch (error) {
        console.error(`❌ Error syncing ${org.name}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n✅ Sync complete!`);
    console.log(`📊 Organizations synced: ${synced}`);
    console.log(`❌ Errors: ${errors}`);
    
    // Verify final count
    const finalCount = await AppDataSource.query(`
      SELECT COUNT(*) as count FROM organizations
    `);
    
    console.log(`🌐 Final Heroku database count: ${finalCount[0].count} organizations`);
    
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

syncOrganizations();
