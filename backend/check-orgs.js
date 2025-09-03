const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/backend/src/app.module.js');
const { YMCAImportService } = require('./dist/backend/src/organizations/services/ymca-import.service.js');

async function checkExistingOrgs() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🔍 Checking existing organizations...');
    const orgs = await importService.organizationRepository.find({
      select: ['id', 'name', 'associationNumber', 'code'],
      take: 10
    });
    
    console.log(`📊 Found ${orgs.length} organizations:`);
    orgs.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name} (Code: ${org.code}, Assoc#: ${org.associationNumber || 'N/A'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await app.close();
  }
}

checkExistingOrgs();
