import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

// Load environment variables first (important for Heroku)
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Self-Reporting Portal (dev)
      'http://localhost:1928',  // Management Hub (dev)
      'http://localhost:3002',  // OEA-UI Frontend (dev)
      'https://*.herokuapp.com', // Heroku apps (production)
      'https://*.ngrok.io',     // ngrok for external testing
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );


  // Global prefix (applied to all routes except those in legacy modules)
  app.setGlobalPrefix('api/v1', {
    exclude: ['api/submissions/(.*)'], // Exclude legacy submissions routes
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('YMCA Self-Reporting Portal API')
    .setDescription('API for YMCA Operational Performance Continuums self-reporting portal')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('organizations', 'Organization management')
    .addTag('users', 'User management')
    .addTag('submissions', 'Survey submissions')
    .addTag('performance', 'Performance calculations')
    .addTag('frameworks', 'Assessment frameworks')
    .addTag('analytics', 'Analytics and reporting')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check endpoint for Heroku
  app.use('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  // Start the application
  const port = parseInt(process.env.PORT || '3001');
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Heroku

  console.log(`🚀 YMCA Self-Reporting Portal API is running on port: ${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health check available at: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
