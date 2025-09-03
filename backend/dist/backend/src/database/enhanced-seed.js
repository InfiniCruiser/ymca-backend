"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const enhanced_migration_seed_1 = require("./seeds/enhanced-migration-seed");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function seedEnhancedDatabase() {
    const dataSource = new typeorm_1.DataSource({
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
        const seeder = new enhanced_migration_seed_1.EnhancedDatabaseSeeder(dataSource);
        await seeder.seed();
        console.log('🎉 Enhanced database seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Enhanced database seeding failed:', error);
        process.exit(1);
    }
    finally {
        await dataSource.destroy();
    }
}
if (require.main === module) {
    seedEnhancedDatabase();
}
//# sourceMappingURL=enhanced-seed.js.map