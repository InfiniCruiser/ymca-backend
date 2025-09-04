"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:1928',
            'http://localhost:3002',
            'https://*.herokuapp.com',
            'https://*.ngrok.io',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api/v1', {
        exclude: ['api/submissions/(.*)'],
    });
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.use('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        });
    });
    const port = parseInt(process.env.PORT || '3001');
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 YMCA Self-Reporting Portal API is running on port: ${port}`);
    console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
    console.log(`🏥 Health check available at: http://localhost:${port}/health`);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map