import { ConfigService } from '@nestjs/config';
export declare class AiConfigService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getConfig(): Promise<{
        azureOpenAI: {
            endpoint: string;
            deployment: string;
            apiVersion: string;
            model: string;
        };
        features: {
            enableAI: boolean;
            enableFallback: boolean;
            enableCaching: boolean;
            maxTokens: number;
            temperature: number;
        };
        monitoring: {
            enableLogging: boolean;
            enableMetrics: boolean;
            logLevel: string;
        };
    }>;
    generateAnalysis(prompt: any, context: any): Promise<{
        content: any;
        usage: any;
        model: string;
    }>;
    getStatus(): Promise<{
        configured: boolean;
        hasApiKey: boolean;
        hasEndpoint: boolean;
        deployment: string;
        model: string;
        features: {
            enableAI: boolean;
            enableFallback: boolean;
            enableCaching: boolean;
        };
        timestamp: string;
    }>;
}
