"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const users_module_1 = require("./users/users.module");
const organizations_module_1 = require("./organizations/organizations.module");
const frameworks_module_1 = require("./frameworks/frameworks.module");
const submissions_module_1 = require("./submissions/submissions.module");
const submissions_legacy_module_1 = require("./submissions/submissions-legacy.module");
const performance_module_1 = require("./performance/performance.module");
const ai_config_module_1 = require("./ai-config/ai-config.module");
const file_uploads_module_1 = require("./file-uploads/file-uploads.module");
const periods_module_1 = require("./periods/periods.module");
const user_entity_1 = require("./users/entities/user.entity");
const organization_entity_1 = require("./organizations/entities/organization.entity");
const framework_entity_1 = require("./frameworks/entities/framework.entity");
const section_entity_1 = require("./frameworks/entities/section.entity");
const area_entity_1 = require("./frameworks/entities/area.entity");
const question_entity_1 = require("./frameworks/entities/question.entity");
const submission_entity_1 = require("./submissions/entities/submission.entity");
const performance_calculation_entity_1 = require("./performance/entities/performance-calculation.entity");
const file_upload_entity_1 = require("./file-uploads/entities/file-upload.entity");
const period_completion_entity_1 = require("./periods/entities/period-completion.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT) || 5432,
                    username: process.env.DB_USERNAME || 'postgres',
                    password: process.env.DB_PASSWORD || 'password',
                    database: process.env.DB_DATABASE || 'ymca_portal',
                    entities: [
                        user_entity_1.User,
                        organization_entity_1.Organization,
                        framework_entity_1.Framework,
                        section_entity_1.Section,
                        area_entity_1.Area,
                        question_entity_1.Question,
                        submission_entity_1.Submission,
                        performance_calculation_entity_1.PerformanceCalculation,
                        file_upload_entity_1.FileUpload,
                        period_completion_entity_1.PeriodCompletion,
                    ],
                    synchronize: process.env.NODE_ENV === 'development',
                    logging: process.env.NODE_ENV === 'development',
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            frameworks_module_1.FrameworksModule,
            submissions_module_1.SubmissionsModule,
            submissions_legacy_module_1.SubmissionsLegacyModule,
            performance_module_1.PerformanceModule,
            ai_config_module_1.AiConfigModule,
            file_uploads_module_1.FileUploadsModule,
            periods_module_1.PeriodsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map