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
var AiConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AiConfigService = AiConfigService_1 = class AiConfigService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiConfigService_1.name);
    }
    async getConfig() {
        return {
            azureOpenAI: {
                endpoint: this.configService.get('AZURE_OPENAI_ENDPOINT'),
                deployment: this.configService.get('AZURE_OPENAI_DEPLOYMENT_NAME'),
                apiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
                model: this.configService.get('AZURE_OPENAI_MODEL')
            },
            features: {
                enableAI: this.configService.get('ENABLE_AI_ADVISORS') === 'true',
                enableFallback: this.configService.get('ENABLE_FALLBACK_ANALYSIS') === 'true',
                enableCaching: this.configService.get('ENABLE_AI_CACHING') === 'true',
                maxTokens: parseInt(this.configService.get('MAX_TOKENS')) || 2000,
                temperature: parseFloat(this.configService.get('TEMPERATURE')) || 0.3
            },
            monitoring: {
                enableLogging: this.configService.get('ENABLE_AI_LOGGING') === 'true',
                enableMetrics: this.configService.get('ENABLE_AI_METRICS') === 'true',
                logLevel: this.configService.get('AI_LOG_LEVEL') || 'info'
            }
        };
    }
    async generateAnalysis(prompt, context) {
        const apiKey = this.configService.get('AZURE_OPENAI_API_KEY');
        const endpoint = this.configService.get('AZURE_OPENAI_ENDPOINT');
        const deployment = this.configService.get('AZURE_OPENAI_DEPLOYMENT_NAME');
        const apiVersion = this.configService.get('AZURE_OPENAI_API_VERSION');
        if (!apiKey || !endpoint) {
            throw new Error('Azure OpenAI not configured');
        }
        try {
            const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: prompt.system },
                        { role: 'user', content: prompt.user }
                    ],
                    max_tokens: parseInt(this.configService.get('MAX_TOKENS')) || 2000,
                    temperature: parseFloat(this.configService.get('TEMPERATURE')) || 0.3,
                    top_p: 0.9,
                    frequency_penalty: 0.1,
                    presence_penalty: 0.1
                })
            });
            if (!response.ok) {
                throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: data.usage,
                model: this.configService.get('AZURE_OPENAI_MODEL')
            };
        }
        catch (error) {
            this.logger.error('Error in AI analysis:', error);
            throw error;
        }
    }
    async getStatus() {
        const apiKey = this.configService.get('AZURE_OPENAI_API_KEY');
        const endpoint = this.configService.get('AZURE_OPENAI_ENDPOINT');
        const deployment = this.configService.get('AZURE_OPENAI_DEPLOYMENT_NAME');
        const model = this.configService.get('AZURE_OPENAI_MODEL');
        return {
            configured: !!(apiKey && endpoint),
            hasApiKey: !!apiKey,
            hasEndpoint: !!endpoint,
            deployment: deployment || 'Not set',
            model: model || 'Not set',
            features: {
                enableAI: this.configService.get('ENABLE_AI_ADVISORS') === 'true',
                enableFallback: this.configService.get('ENABLE_FALLBACK_ANALYSIS') === 'true',
                enableCaching: this.configService.get('ENABLE_AI_CACHING') === 'true'
            },
            timestamp: new Date().toISOString()
        };
    }
};
exports.AiConfigService = AiConfigService;
exports.AiConfigService = AiConfigService = AiConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiConfigService);
//# sourceMappingURL=ai-config.service.js.map