"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceTypeSchema = exports.QuestionTypeSchema = exports.PeriodStatusSchema = exports.ResponseStatusSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum([
    'PROGRAM_OWNER',
    'ASSOCIATION_ADMIN',
    'BOARD_LIAISON',
    'YUSA_REVIEWER',
    'AUDITOR',
    'TESTER'
]);
exports.ResponseStatusSchema = zod_1.z.enum([
    'NOT_STARTED',
    'IN_PROGRESS',
    'NEEDS_EVIDENCE',
    'SUBMITTED',
    'RETURNED',
    'APPROVED'
]);
exports.PeriodStatusSchema = zod_1.z.enum([
    'DRAFT',
    'ACTIVE',
    'REVIEW',
    'BOARD_APPROVED',
    'FINALIZED',
    'ARCHIVED'
]);
exports.QuestionTypeSchema = zod_1.z.enum([
    'single_select',
    'multi_select',
    'text',
    'date',
    'number',
    'file_upload'
]);
exports.EvidenceTypeSchema = zod_1.z.enum([
    'file',
    'link',
    'integration_data'
]);
//# sourceMappingURL=index.js.map