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
const ceo_approval_service_1 = require("./ceo-approval.service");
const submissions_service_1 = require("./submissions.service");
const submission_entity_1 = require("./entities/submission.entity");
let SubmissionsController = class SubmissionsController {
    constructor(ceoApprovalService, submissionsService) {
        this.ceoApprovalService = ceoApprovalService;
        this.submissionsService = submissionsService;
    }
    async editSubmission(organizationId, periodId, updates, req) {
        const userId = req.user?.sub || 'temp-user-id';
        if (!organizationId || !periodId) {
            throw new Error('organizationId and periodId are required');
        }
        try {
            return await this.ceoApprovalService.editSubmission(organizationId, periodId, updates);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException('NO_SUBMISSION');
            }
            if (error instanceof common_1.ForbiddenException) {
                throw new common_1.ForbiddenException('SUBMISSION_LOCKED');
            }
            throw error;
        }
    }
    async getPeriodStats(organizationId, periodId) {
        if (!organizationId || !periodId) {
            throw new Error('organizationId and periodId are required');
        }
        return this.submissionsService.getPeriodStats(organizationId, periodId);
    }
};
exports.SubmissionsController = SubmissionsController;
__decorate([
    (0, common_1.Put)('current'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Edit submission (only while OPEN)' }),
    (0, swagger_1.ApiQuery)({ name: 'orgId', description: 'Organization ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'period', description: 'Period ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission updated successfully', type: submission_entity_1.Submission }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No submission found' }),
    (0, swagger_1.ApiResponse)({ status: 423, description: 'Submission is locked' }),
    __param(0, (0, common_1.Query)('orgId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "editSubmission", null);
__decorate([
    (0, common_1.Get)('period-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get submission statistics for a specific period' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', description: 'Organization ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', description: 'Period ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Period statistics retrieved successfully' }),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubmissionsController.prototype, "getPeriodStats", null);
exports.SubmissionsController = SubmissionsController = __decorate([
    (0, swagger_1.ApiTags)('submissions'),
    (0, common_1.Controller)('submissions'),
    (0, common_1.UseGuards)(),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ceo_approval_service_1.CeoApprovalService,
        submissions_service_1.SubmissionsService])
], SubmissionsController);
//# sourceMappingURL=submissions.controller.js.map