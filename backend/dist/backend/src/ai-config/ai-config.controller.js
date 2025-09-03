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
exports.AiConfigController = void 0;
const common_1 = require("@nestjs/common");
const ai_config_service_1 = require("./ai-config.service");
let AiConfigController = class AiConfigController {
    constructor(aiConfigService) {
        this.aiConfigService = aiConfigService;
    }
    async getConfig() {
        try {
            const config = await this.aiConfigService.getConfig();
            return {
                success: true,
                config: config,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                error: 'Failed to load AI configuration',
                timestamp: new Date().toISOString()
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateAnalysis(body) {
        try {
            const { prompt, context } = body;
            const result = await this.aiConfigService.generateAnalysis(prompt, context);
            return {
                success: true,
                content: result.content,
                usage: result.usage,
                model: result.model,
                source: 'azure-openai'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                error: error.message,
                fallback: true
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStatus() {
        try {
            const status = await this.aiConfigService.getStatus();
            return {
                success: true,
                status: status
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                error: 'Failed to get AI status'
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AiConfigController = AiConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('analysis'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiConfigController.prototype, "generateAnalysis", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiConfigController.prototype, "getStatus", null);
exports.AiConfigController = AiConfigController = __decorate([
    (0, common_1.Controller)('ai-config'),
    __metadata("design:paramtypes", [ai_config_service_1.AiConfigService])
], AiConfigController);
//# sourceMappingURL=ai-config.controller.js.map