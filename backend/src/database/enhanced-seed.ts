import { DataSource } from 'typeorm';
import { EnhancedDatabaseSeeder } from './seeds/enhanced-migration-seed';
import { config } from 'dotenv';

// Load environment variables
config();

async function seedEnhancedDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'ymca_portal',
    entities: [
      'src/**/*.entity.ts'
    ],
    synchronize: true,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Database connection established');

    const seeder = new EnhancedDatabaseSeeder(dataSource);
    await seeder.seed();

    console.log('🎉 Enhanced database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Enhanced database seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedEnhancedDatabase();
}
