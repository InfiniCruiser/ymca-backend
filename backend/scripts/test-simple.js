const { DataSource } = require('typeorm');
const { Organization } = require('../dist/backend/src/organizations/entities/organization.entity.js');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'ymca_portal',
  entities: [Organization],
  synchronize: false,
});

async function testSimple() {
  try {
    await dataSource.initialize();
    console.log('🔌 Connected to database');

    const orgRepo = dataSource.getRepository(Organization);
    
    // Test basic query
    const totalOrgs = await orgRepo.count();
    console.log(`📊 Total organizations: ${totalOrgs}`);
    
    // Test YMCA query
    const ymcaOrgs = await orgRepo.find({
      where: { type: 'LOCAL_Y' }
    });
    console.log(`🏢 YMCA organizations: ${ymcaOrgs.length}`);
    
    if (ymcaOrgs.length > 0) {
      console.log('First YMCA:', {
        id: ymcaOrgs[0].id,
        name: ymcaOrgs[0].name,
        type: ymcaOrgs[0].type
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

testSimple();
