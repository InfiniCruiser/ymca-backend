"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const submissions_controller_1 = require("./submissions.controller");
const submissions_service_1 = require("./submissions.service");
const draft_controller_1 = require("./draft.controller");
const draft_service_1 = require("./draft.service");
const ceo_approval_controller_1 = require("./ceo-approval.controller");
const ceo_approval_service_1 = require("./ceo-approval.service");
const submission_entity_1 = require("./entities/submission.entity");
const draft_entity_1 = require("./entities/draft.entity");
const file_upload_entity_1 = require("../file-uploads/entities/file-upload.entity");
const performance_module_1 = require("../performance/performance.module");
let SubmissionsModule = class SubmissionsModule {
};
exports.SubmissionsModule = SubmissionsModule;
exports.SubmissionsModule = SubmissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([submission_entity_1.Submission, draft_entity_1.Draft, file_upload_entity_1.FileUpload]),
            performance_module_1.PerformanceModule,
        ],
        controllers: [submissions_controller_1.SubmissionsController, draft_controller_1.DraftController, ceo_approval_controller_1.CeoApprovalController],
        providers: [submissions_service_1.SubmissionsService, draft_service_1.DraftService, ceo_approval_service_1.CeoApprovalService],
        exports: [submissions_service_1.SubmissionsService, draft_service_1.DraftService, ceo_approval_service_1.CeoApprovalService],
    })
], SubmissionsModule);
//# sourceMappingURL=submissions.module.js.map