const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/backend/src/app.module.js');
const { YMCAImportService } = require('../dist/backend/src/organizations/services/ymca-import.service.js');

async function testSingleUpdate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🧪 Testing single organization update...');
    
    // Find the organization
    const organization = await importService.organizationRepository.findOne({
      where: { name: 'YMCA of Greater Birmingham' }
    });
    
    if (organization) {
      console.log('✅ Found organization:', organization.name);
      console.log('Current coordinates:', organization.latitude, organization.longitude);
      console.log('Current association number:', organization.associationNumber);
      
      // Create a mock CSV row for this organization
      const mockCSVRow = {
        'Association Number': '0012',
        'Association Name': 'YMCA of Greater Birmingham',
        'Latitude': '33.5177',
        'Longitude': '-86.8055',
        'Physical Address': '2400 7th Avenue South',
        'Physical City': 'Birmingham',
        'Physical State': 'Alabama',
        'Physical ZIP Code': '35233',
        'Phone Number': '(205) 322-2262',
        'Email': 'info@ymcabham.org',
        'Website': 'www.ymcabham.org',
        'CEO Name': 'Dan Pile',
        'Charter Status': 'Chartered',
        'Association Branch Count': '12',
        'BudgetRange': '$10M-$25M',
        'CRM Provider': 'Salesforce',
        'Facility Type': 'Facility',
        'Is Association': 'Yes',
        'Is Chartered': 'Yes',
        'Is Learning Center': 'No',
        'Level': 'Metropolitan',
        'Member Group': 'Metropolitan',
        'Y Status': 'Open',
        'Y Type': 'Corporate Association'
      };
      
      // Update the organization
      const result = await importService.updateOrganizationFromCSV(organization, mockCSVRow);
      
      if (result) {
        console.log('✅ Successfully updated organization!');
        
        // Check the updated values
        const updatedOrg = await importService.organizationRepository.findOne({
          where: { name: 'YMCA of Greater Birmingham' }
        });
        
        console.log('Updated coordinates:', updatedOrg.latitude, updatedOrg.longitude);
        console.log('Updated association number:', updatedOrg.associationNumber);
        console.log('Updated address:', updatedOrg.address);
        console.log('Updated city:', updatedOrg.city);
        console.log('Updated state:', updatedOrg.state);
      } else {
        console.log('❌ Failed to update organization');
      }
    } else {
      console.log('❌ Organization not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await app.close();
  }
}

testSingleUpdate()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

