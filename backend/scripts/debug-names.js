const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/backend/src/app.module.js');
const { YMCAImportService } = require('../dist/backend/src/organizations/services/ymca-import.service.js');

async function debugNames() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🔍 Debugging organization names...');
    
    // Get organizations from database
    const dbOrgs = await importService.organizationRepository.find({
      take: 10
    });
    
    console.log('\n📋 First 10 organizations in database:');
    dbOrgs.forEach((org, index) => {
      console.log(`${index + 1}. "${org.name}"`);
    });
    
    // Get CSV data
    const csvFilePath = require('path').join(process.cwd(), '..', 'docs', 'Final Pilot Ys - Y Profile.csv');
    const fs = require('fs');
    const csv = require('csv-parser');
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found at: ${csvFilePath}`);
    }

    const results = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log('\n📋 First 10 organizations in CSV:');
          results.slice(0, 10).forEach((row, index) => {
            console.log(`${index + 1}. "${row['Association Name']}"`);
          });
          
          // Check for exact matches
          console.log('\n🔍 Checking for exact matches...');
          let matches = 0;
          
          for (const row of results) {
            const csvName = row['Association Name']?.trim();
            if (csvName) {
              const dbOrg = await importService.organizationRepository.findOne({
                where: { name: csvName }
              });
              
              if (dbOrg) {
                matches++;
                console.log(`✅ MATCH: "${csvName}"`);
              }
            }
          }
          
          console.log(`\n📊 Found ${matches} exact matches out of ${results.length} CSV entries`);
          
          resolve();
        })
        .on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await app.close();
  }
}

debugNames()
  .then(() => {
    console.log('✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });

