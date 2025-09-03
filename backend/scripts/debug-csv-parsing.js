const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/backend/src/app.module.js');
const { YMCAImportService } = require('../dist/backend/src/organizations/services/ymca-import.service.js');

async function debugCSVParsing() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🔍 Debugging CSV parsing...');
    
    // Get the CSV data
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
          console.log(`📊 Found ${results.length} rows in CSV`);
          
          // Show first few rows using the new method
          console.log('\n📋 First 3 CSV rows:');
          results.slice(0, 3).forEach((row, index) => {
            // Use the same approach as the import service
            const values = Object.values(row);
            console.log(`Row ${index + 1}:`);
            console.log(`  Association Number: "${values[0]}"`);
            console.log(`  Association Name: "${values[1]}"`);
            console.log(`  Latitude: "${values[29]}"`);
            console.log(`  Longitude: "${values[31]}"`);
            console.log('');
          });
          
          // Check for exact matches
          console.log('🔍 Checking for exact matches...');
          let matches = 0;
          
          for (const row of results) {
            const values = Object.values(row);
            const csvName = values[1]?.trim();
            if (csvName) {
              try {
                const dbOrg = await importService.organizationRepository.findOne({
                  where: { name: csvName }
                });
                
                if (dbOrg) {
                  matches++;
                  console.log(`✅ MATCH: "${csvName}"`);
                }
              } catch (error) {
                console.log(`⚠️  Database query failed for "${csvName}": ${error.message}`);
                break; // Stop if database connection fails
              }
            }
          }
          
          console.log(`\n📊 Found ${matches} exact matches out of ${results.length} CSV entries`);
          
          // Show some database organizations for comparison
          try {
            console.log('\n📋 First 5 database organizations:');
            const dbOrgs = await importService.organizationRepository.find({
              take: 5
            });
            
            dbOrgs.forEach((org, index) => {
              console.log(`${index + 1}. "${org.name}"`);
            });
          } catch (error) {
            console.log(`⚠️  Could not fetch database organizations: ${error.message}`);
          }
          
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

debugCSVParsing()
  .then(() => {
    console.log('✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });

