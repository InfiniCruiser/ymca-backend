const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/backend/src/app.module.js');
const { YMCAImportService } = require('../dist/backend/src/organizations/services/ymca-import.service.js');

async function updateCoordinates() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🌍 Starting coordinate update for existing organizations...');
    
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
          let errors = 0;
          
          for (const row of results) {
            try {
              const associationNumber = row['Association Number']?.trim();
              const latitudeStr = row['Latitude']?.trim();
              const longitudeStr = row['Longitude']?.trim();
              
              if (associationNumber && latitudeStr && longitudeStr) {
                const latitude = parseFloat(latitudeStr);
                const longitude = parseFloat(longitudeStr);
                
                if (!isNaN(latitude) && !isNaN(longitude)) {
                  // Update the organization with coordinates and association number
                  const result = await importService.updateOrganizationCoordinates(
                    associationNumber, 
                    latitude, 
                    longitude,
                    row['Association Name']
                  );
                  
                  if (result) {
                    updated++;
                    console.log(`✅ Updated coordinates for ${row['Association Name']}: ${latitude}, ${longitude}`);
                  }
                }
              }
            } catch (error) {
              errors++;
              console.error(`❌ Error updating ${row['Association Name']}:`, error.message);
            }
          }
          
          console.log(`\n📊 Coordinate Update Summary:`);
          console.log(`✅ Updated: ${updated} organizations`);
          console.log(`❌ Errors: ${errors} organizations`);
          
          resolve({ updated, errors });
        })
        .on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ Coordinate update failed:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

updateCoordinates()
  .then(() => {
    console.log('✅ Coordinate update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Coordinate update failed:', error);
    process.exit(1);
  });
