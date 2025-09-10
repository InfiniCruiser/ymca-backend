import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

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

export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl,
  entities: [
    // Use string paths for entities to avoid import issues
    'dist/backend/src/users/entities/user.entity.js',
    'dist/backend/src/organizations/entities/organization.entity.js',
    'dist/backend/src/frameworks/entities/framework.entity.js',
    'dist/backend/src/frameworks/entities/section.entity.js',
    'dist/backend/src/frameworks/entities/area.entity.js',
    'dist/backend/src/frameworks/entities/question.entity.js',
    'dist/backend/src/submissions/entities/submission.entity.js',
    'dist/backend/src/performance/entities/performance-calculation.entity.js',
    'dist/backend/src/file-uploads/entities/file-upload.entity.js',
    'dist/backend/src/grading/entities/document-category-grade.entity.js',
    'dist/backend/src/grading/entities/review-submission.entity.js',
    'dist/backend/src/grading/entities/review-history.entity.js',
  ],
  migrations: ['dist/backend/src/database/migrations/*.js'],
  synchronize: false, // Disable synchronize for migrations
  logging: process.env.NODE_ENV === 'development',
});
