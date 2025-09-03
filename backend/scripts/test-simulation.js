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

async function testSimulation() {
  try {
    await dataSource.initialize();
    console.log('🔌 Connected to database');

    // Test organization query
    const orgRepo = dataSource.getRepository(Organization);
    const allOrgs = await orgRepo.find();
    console.log(`📊 Total organizations: ${allOrgs.length}`);

    const ymcaOrgs = await orgRepo.find({
      where: { type: 'LOCAL_Y' }
    });
    console.log(`🏢 YMCA organizations found: ${ymcaOrgs.length}`);

    if (ymcaOrgs.length > 0) {
      console.log('First YMCA:', {
        id: ymcaOrgs[0].id,
        name: ymcaOrgs[0].name,
        type: ymcaOrgs[0].type
      });
    }

    // Test with different query approaches
    const orgsWithType = await orgRepo.createQueryBuilder('org')
      .where('org.type = :type', { type: 'LOCAL_Y' })
      .getMany();
    console.log(`🔍 QueryBuilder YMCAs found: ${orgsWithType.length}`);

    // Check all unique types
    const types = await orgRepo.createQueryBuilder('org')
      .select('org.type')
      .distinct()
      .getRawMany();
    console.log('📋 All organization types:', types.map(t => t.org_type));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

testSimulation();
