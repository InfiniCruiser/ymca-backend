import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { FrameworksModule } from './frameworks/frameworks.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { PerformanceModule } from './performance/performance.module';
import { AiConfigModule } from './ai-config/ai-config.module';

// Database entities
import { User } from './users/entities/user.entity';
import { Organization } from './organizations/entities/organization.entity';
import { Framework } from './frameworks/entities/framework.entity';
import { Section } from './frameworks/entities/section.entity';
import { Area } from './frameworks/entities/area.entity';
import { Question } from './frameworks/entities/question.entity';
import { Submission } from './submissions/entities/submission.entity';
import { PerformanceCalculation } from './performance/entities/performance-calculation.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'ymca_portal',
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
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
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
    PerformanceModule,
    AiConfigModule,
  ],
})
export class AppModule {}
