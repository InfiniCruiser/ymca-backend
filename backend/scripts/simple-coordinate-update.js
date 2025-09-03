const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/backend/src/app.module.js');
const { YMCAImportService } = require('../dist/backend/src/organizations/services/ymca-import.service.js');

async function simpleCoordinateUpdate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🔍 Simple coordinate update for exact name matches...');
    
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
              
              if (csvName && associationNumber && latitudeStr && longitudeStr) {
                // Find exact name match in database
                const organization = await importService.organizationRepository.findOne({
                  where: { name: csvName }
                });
                
                if (organization) {
                  // Only update coordinates and association number
                  const latitude = parseFloat(latitudeStr);
                  const longitude = parseFloat(longitudeStr);
                  
                  if (!isNaN(latitude) && !isNaN(longitude)) {
                    organization.latitude = latitude;
                    organization.longitude = longitude;
                    organization.associationNumber = associationNumber;
                    
                    await importService.organizationRepository.save(organization);
                    
                    updated++;
                    console.log(`✅ Updated ${csvName}: ${latitude}, ${longitude}, #${associationNumber}`);
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
          
          console.log(`\n📊 Simple Coordinate Update Summary:`);
          console.log(`✅ Updated: ${updated} organizations`);
          console.log(`❌ Not Found: ${notFound} organizations`);
          console.log(`❌ Errors: ${errors} organizations`);
          
          resolve({ updated, notFound, errors });
        })
        .on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ Simple coordinate update failed:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

simpleCoordinateUpdate()
  .then(() => {
    console.log('✅ Simple coordinate update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Simple coordinate update failed:', error);
    process.exit(1);
  });

