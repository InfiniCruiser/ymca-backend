"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const submissions_service_1 = require("./submissions.service");
const submission_entity_1 = require("./entities/submission.entity");
let SubmissionsController = class SubmissionsController {
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    async create(createSubmissionDto) {
        return this.submissionsService.create(createSubmissionDto);
    }
    async submitDraft(submitDto) {
        return this.submissionsService.submitDraft(submitDto);
    }
    async findAll() {
        return this.submissionsService.findAll();
    }
    async getStats() {
        return this.submissionsService.getSubmissionStats();
    }
    async getDashboardStats(organizationId) {
        return this.submissionsService.getDashboardStats(organizationId);
    }
    async findByPeriodId(periodId) {
        return this.submissionsService.findByPeriodId(periodId);
    }
    async findLatestSubmission(organizationId, periodId) {
        return this.submissionsService.findLatestSubmission(organizationId, periodId);
    }
    async findSubmissionHistory(organizationId, periodId) {
        return this.submissionsService.findSubmissionHistory(organizationId, periodId);
    }
    async findDraftSubmission(organizationId, periodId) {
        return this.submissionsService.findDraftSubmission(organizationId, periodId);
    }
    async update(id, updateSubmissionDto) {
        console.log(`🔄 PUT /api/v1/submissions/${id} called with:`, updateSubmissionDto);
        return this.submissionsService.update(id, updateSubmissionDto);
    }
    async findOne(id) {
        return this.submissionsService.findOne(id);
    }
    async autoSubmitDraftsForPeriod(periodId) {
        return this.submissionsService.autoSubmitDraftsForPeriod(periodId);
    }
    async clearAll() {
        return this.submissionsService.clearAll();
    }
};
exports.SubmissionsController = SubmissionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new submission (draft or submitted)' }),
    (0, swagger_1.ApiBody)({ type: 'object' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Submission created successfully', type: submission_entity_1.Submission }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a draft submission' }),
    (0, swagger_1.ApiBody)({ type: 'object' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Draft submitted successfully', type: submission_entity_1.Submission }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "submitDraft", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all submissions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all submissions', type: [submission_entity_1.Submission] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get submission statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics for an organization' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', description: 'Organization ID to filter by', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard statistics for the organization' }),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('period/:periodId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all submissions for a specific period' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submissions for period', type: [submission_entity_1.Submission] }),
    __param(0, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "findByPeriodId", null);
__decorate([
    (0, common_1.Get)('latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest submission for organization and period' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', description: 'Organization ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', description: 'Period ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Latest submission found', type: submission_entity_1.Submission }),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "findLatestSubmission", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get submission history for organization and period' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', description: 'Organization ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', description: 'Period ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission history', type: [submission_entity_1.Submission] }),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "findSubmissionHistory", null);
__decorate([
    (0, common_1.Get)('draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current draft submission for organization and period' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', description: 'Organization ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', description: 'Period ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Draft submission found', type: submission_entity_1.Submission }),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "findDraftSubmission", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update a submission' }),
    (0, swagger_1.ApiBody)({ type: 'object' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission updated successfully', type: submission_entity_1.Submission }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific submission by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission found', type: submission_entity_1.Submission }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('auto-submit/:periodId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Auto-submit all draft submissions for a period' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Drafts auto-submitted successfully' }),
    __param(0, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "autoSubmitDraftsForPeriod", null);
__decorate([
    (0, common_1.Delete)('clear-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all submissions (for development/testing)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All submissions cleared successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "clearAll", null);
exports.SubmissionsController = SubmissionsController = __decorate([
    (0, swagger_1.ApiTags)('submissions'),
    (0, common_1.Controller)('submissions'),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], SubmissionsController);
//# sourceMappingURL=submissions.controller.js.map