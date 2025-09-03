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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const organizations_service_1 = require("./organizations.service");
const ymca_import_service_1 = require("./services/ymca-import.service");
const organization_entity_1 = require("./entities/organization.entity");
const dto_1 = require("./dto");
let OrganizationsController = class OrganizationsController {
    constructor(organizationsService, ymcaImportService) {
        this.organizationsService = organizationsService;
        this.ymcaImportService = ymcaImportService;
    }
    async create(createOrganizationDto) {
        return this.organizationsService.create(createOrganizationDto);
    }
    async findAll() {
        return this.organizationsService.findAll();
    }
    async findOne(id) {
        return this.organizationsService.findOne(id);
    }
    async update(id, updateOrganizationDto) {
        return this.organizationsService.update(id, updateOrganizationDto);
    }
    async remove(id) {
        return this.organizationsService.remove(id);
    }
    async getChildren(id) {
        return this.organizationsService.getChildren(id);
    }
    async getParent(id) {
        return this.organizationsService.getParent(id);
    }
    async importYMCAData() {
        return this.ymcaImportService.importYMCAData();
    }
    async importYMCADataFromFile(file) {
        const fs = require('fs');
        const path = require('path');
        const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}_ymca_import.csv`);
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(tempPath, file.buffer);
        try {
            const result = await this.ymcaImportService.importYMCAData(tempPath);
            fs.unlinkSync(tempPath);
            return result;
        }
        catch (error) {
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
            throw error;
        }
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new organization' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateOrganizationDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Organization created successfully', type: organization_entity_1.Organization }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all organizations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all organizations', type: [organization_entity_1.Organization] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Organization found', type: organization_entity_1.Organization }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update organization by ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateOrganizationDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Organization updated successfully', type: organization_entity_1.Organization }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete organization by ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Organization deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/children'),
    (0, swagger_1.ApiOperation)({ summary: 'Get child organizations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Child organizations', type: [organization_entity_1.Organization] }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getChildren", null);
__decorate([
    (0, common_1.Get)(':id/parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get parent organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parent organization', type: organization_entity_1.Organization }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getParent", null);
__decorate([
    (0, common_1.Post)('import/ymca'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Import YMCA associations from CSV file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Import completed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "importYMCAData", null);
__decorate([
    (0, common_1.Post)('import/ymca/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Import YMCA associations from uploaded CSV file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Import completed successfully' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "importYMCADataFromFile", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('organizations'),
    (0, common_1.Controller)('organizations'),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService,
        ymca_import_service_1.YMCAImportService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map