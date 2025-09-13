import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { FrameworksModule } from './frameworks/frameworks.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { SubmissionsLegacyModule } from './submissions/submissions-legacy.module';
import { PerformanceModule } from './performance/performance.module';
import { AiConfigModule } from './ai-config/ai-config.module';
import { FileUploadsModule } from './file-uploads/file-uploads.module';
import { PeriodsModule } from './periods/periods.module';
import { GradingModule } from './grading/grading.module';
import { AuthModule } from './auth/auth.module';
import { UploadStatusModule } from './upload-status.module';

// Database entities
import { User } from './users/entities/user.entity';
import { Organization } from './organizations/entities/organization.entity';
import { Framework } from './frameworks/entities/framework.entity';
import { Section } from './frameworks/entities/section.entity';
import { Area } from './frameworks/entities/area.entity';
import { Question } from './frameworks/entities/question.entity';
import { Submission } from './submissions/entities/submission.entity';
import { PerformanceCalculation } from './performance/entities/performance-calculation.entity';
import { FileUpload } from './file-uploads/entities/file-upload.entity';
import { PeriodCompletion } from './periods/entities/period-completion.entity';
import { PeriodConfiguration } from './periods/entities/period-configuration.entity';
import { DocumentCategoryGrade } from './grading/entities/document-category-grade.entity';
import { ReviewSubmission } from './grading/entities/review-submission.entity';
import { ReviewHistory } from './grading/entities/review-history.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // Parse DATABASE_URL for Heroku compatibility
        let dbConfig;
        if (process.env.DATABASE_URL) {
          const url = new URL(process.env.DATABASE_URL);
          dbConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading slash
            ssl: { rejectUnauthorized: false }, // Required for Heroku Postgres
          };
        } else {
          // Fallback to individual environment variables
          dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_DATABASE || 'ymca_portal',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'postgres',
          ...dbConfig,
          entities: [
            User,
            Organization,
            Framework,
            Section,
            Area,
            Question,
            Submission,
            PerformanceCalculation,
            FileUpload,
            PeriodCompletion,
            PeriodConfiguration,
            DocumentCategoryGrade,
            ReviewSubmission,
            ReviewHistory,
          ],
          synchronize: process.env.NODE_ENV === 'development',
          logging: process.env.NODE_ENV === 'development',
        };
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature modules
    UsersModule,
    OrganizationsModule,
    FrameworksModule,
    SubmissionsModule,
    SubmissionsLegacyModule,
    PerformanceModule,
    AiConfigModule,
    FileUploadsModule,
    PeriodsModule,
    GradingModule,
    AuthModule,
    UploadStatusModule,
  ],
})
export class AppModule {}
