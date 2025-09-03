import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Database entities - use compiled JavaScript files
import { User } from '../users/entities/user.entity.js';
import { Organization } from '../organizations/entities/organization.entity.js';
import { Framework } from '../frameworks/entities/framework.entity.js';
import { Section } from '../frameworks/entities/section.entity.js';
import { Area } from '../frameworks/entities/area.entity.js';
import { Question } from '../frameworks/entities/question.entity.js';
import { Submission } from '../submissions/entities/submission.entity.js';
import { PerformanceCalculation } from '../performance/entities/performance-calculation.entity.js';

// Parse DATABASE_URL for Heroku compatibility
function getDatabaseConfig() {
  // Check if DATABASE_URL is provided (Heroku)
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    console.log('🔗 Using DATABASE_URL:', url.hostname, url.port, url.pathname.slice(1));
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      ssl: { rejectUnauthorized: false }, // Required for Heroku Postgres
    };
  }

  // Fallback to individual environment variables
  console.log('🔗 Using individual DB variables:', process.env.DB_HOST, process.env.DB_PORT);
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'ymca_portal',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
}

const dbConfig = getDatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl,
  entities: [
    User,
    Organization,
    Framework,
    Section,
    Area,
    Question,
    Submission,
    PerformanceCalculation,
  ],
  migrations: ['dist/src/database/migrations/*.js'],
  synchronize: false, // Disable synchronize for migrations
  logging: process.env.NODE_ENV === 'development',
});
