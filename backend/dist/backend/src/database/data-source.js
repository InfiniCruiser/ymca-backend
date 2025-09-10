"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const isProduction = process.env.NODE_ENV === 'production';
const entityPath = isProduction ? '../users/entities/user.entity.js' : '../users/entities/user.entity.js';
const user_entity_js_1 = require("../users/entities/user.entity.js");
const organization_entity_js_1 = require("../organizations/entities/organization.entity.js");
const framework_entity_js_1 = require("../frameworks/entities/framework.entity.js");
const section_entity_js_1 = require("../frameworks/entities/section.entity.js");
const area_entity_js_1 = require("../frameworks/entities/area.entity.js");
const question_entity_js_1 = require("../frameworks/entities/question.entity.js");
const submission_entity_js_1 = require("../submissions/entities/submission.entity.js");
const performance_calculation_entity_js_1 = require("../performance/entities/performance-calculation.entity.js");
const file_upload_entity_js_1 = require("../file-uploads/entities/file-upload.entity.js");
const document_category_grade_entity_js_1 = require("../grading/entities/document-category-grade.entity.js");
const review_submission_entity_js_1 = require("../grading/entities/review-submission.entity.js");
const review_history_entity_js_1 = require("../grading/entities/review-history.entity.js");
const period_configuration_entity_js_1 = require("../periods/entities/period-configuration.entity.js");
function getDatabaseConfig() {
    if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        console.log('🔗 Using DATABASE_URL:', url.hostname, url.port, url.pathname.slice(1));
        return {
            host: url.hostname,
            port: parseInt(url.port) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            ssl: { rejectUnauthorized: false },
        };
    }
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
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: dbConfig.ssl,
    entities: [
        user_entity_js_1.User,
        organization_entity_js_1.Organization,
        framework_entity_js_1.Framework,
        section_entity_js_1.Section,
        area_entity_js_1.Area,
        question_entity_js_1.Question,
        submission_entity_js_1.Submission,
        performance_calculation_entity_js_1.PerformanceCalculation,
        file_upload_entity_js_1.FileUpload,
        document_category_grade_entity_js_1.DocumentCategoryGrade,
        review_submission_entity_js_1.ReviewSubmission,
        review_history_entity_js_1.ReviewHistory,
        period_configuration_entity_js_1.PeriodConfiguration,
    ],
    migrations: [process.env.NODE_ENV === 'production' ? 'dist/backend/src/database/migrations/*.js' : 'dist/src/database/migrations/*.js'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=data-source.js.map