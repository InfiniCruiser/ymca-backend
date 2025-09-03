import { AiConfigService } from './ai-config.service';
export declare class AiConfigController {
    private readonly aiConfigService;
    constructor(aiConfigService: AiConfigService);
    getConfig(): Promise<{
        success: boolean;
        config: {
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
        };
        timestamp: string;
    }>;
    generateAnalysis(body: {
        prompt: any;
        context: any;
    }): Promise<{
        success: boolean;
        content: any;
        usage: any;
        model: string;
        source: string;
    }>;
    getStatus(): Promise<{
        success: boolean;
        status: {
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
        };
    }>;
}
