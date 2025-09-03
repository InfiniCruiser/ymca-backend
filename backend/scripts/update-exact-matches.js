const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/backend/src/app.module.js');
const { YMCAImportService } = require('../dist/backend/src/organizations/services/ymca-import.service.js');

async function updateExactMatches() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🔍 Finding exact name matches between CSV and database...');
    
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
          console.log(`📊 Processing ${results.length} organizations from CSV...`);
          
          let updated = 0;
          let notFound = 0;
          let errors = 0;
          
          for (const row of results) {
            try {
              const csvName = row['Association Name']?.trim();
              const associationNumber = row['Association Number']?.trim();
              const latitudeStr = row['Latitude']?.trim();
              const longitudeStr = row['Longitude']?.trim();
              
              if (csvName && associationNumber) {
                // Find exact name match in database
                const organization = await importService.organizationRepository.findOne({
                  where: { name: csvName }
                });
                
                if (organization) {
                  // Update all fields from CSV
                  const updateResult = await importService.updateOrganizationFromCSV(organization, row);
                  
                  if (updateResult) {
                    updated++;
                    console.log(`✅ Updated ${csvName}: ${latitudeStr}, ${longitudeStr}`);
                  }
                } else {
                  notFound++;
                  console.log(`❌ No exact match found for: ${csvName}`);
                }
              }
            } catch (error) {
              errors++;
              console.error(`❌ Error updating ${row['Association Name']}:`, error.message);
            }
          }
          
          console.log(`\n📊 Exact Match Update Summary:`);
          console.log(`✅ Updated: ${updated} organizations`);
          console.log(`❌ Not Found: ${notFound} organizations`);
          console.log(`❌ Errors: ${errors} organizations`);
          
          resolve({ updated, notFound, errors });
        })
        .on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ Exact match update failed:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

updateExactMatches()
  .then(() => {
    console.log('✅ Exact match update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Exact match update failed:', error);
    process.exit(1);
  });

