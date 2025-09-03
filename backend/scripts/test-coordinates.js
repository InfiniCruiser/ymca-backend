const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/backend/src/app.module.js');
const { YMCAImportService } = require('../dist/backend/src/organizations/services/ymca-import.service.js');

async function testCoordinates() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🧪 Testing coordinate update...');
    
    // Test with a specific organization
    const testResult = await importService.updateOrganizationCoordinates(
      '0001', // Association number
      36.16,  // Latitude
      -85.4799, // Longitude
      'Putnam County Family YMCA' // Name
    );
    
    console.log('Test result:', testResult);
    
    // Check if the organization exists
    const organization = await importService.organizationRepository.findOne({
      where: { name: 'Putnam County Family YMCA' }
    });
    
    if (organization) {
      console.log('✅ Found organization:', organization.name);
      console.log('Current coordinates:', organization.latitude, organization.longitude);
    } else {
      console.log('❌ Organization not found');
      
      // List some organizations in the database
      const orgs = await importService.organizationRepository.find({
        take: 5
      });
      console.log('Sample organizations in DB:');
      orgs.forEach(org => console.log('-', org.name));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await app.close();
  }
}

testCoordinates()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

