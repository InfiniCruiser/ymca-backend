import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  async getConfig() {
    return {
      azureOpenAI: {
        endpoint: this.configService.get<string>('AZURE_OPENAI_ENDPOINT'),
        deployment: this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME'),
        apiVersion: this.configService.get<string>('AZURE_OPENAI_API_VERSION'),
        model: this.configService.get<string>('AZURE_OPENAI_MODEL')
      },
      features: {
        enableAI: this.configService.get<string>('ENABLE_AI_ADVISORS') === 'true',
        enableFallback: this.configService.get<string>('ENABLE_FALLBACK_ANALYSIS') === 'true',
        enableCaching: this.configService.get<string>('ENABLE_AI_CACHING') === 'true',
        maxTokens: parseInt(this.configService.get<string>('MAX_TOKENS')) || 2000,
        temperature: parseFloat(this.configService.get<string>('TEMPERATURE')) || 0.3
      },
      monitoring: {
        enableLogging: this.configService.get<string>('ENABLE_AI_LOGGING') === 'true',
        enableMetrics: this.configService.get<string>('ENABLE_AI_METRICS') === 'true',
        logLevel: this.configService.get<string>('AI_LOG_LEVEL') || 'info'
      }
    };
  }

  async generateAnalysis(prompt: any, context: any) {
    const apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    const endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');
    const deployment = this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME');
    const apiVersion = this.configService.get<string>('AZURE_OPENAI_API_VERSION');

    if (!apiKey || !endpoint) {
      throw new Error('Azure OpenAI not configured');
    }

    try {
      const response = await fetch(
        `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
        {
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
            max_tokens: parseInt(this.configService.get<string>('MAX_TOKENS')) || 2000,
            temperature: parseFloat(this.configService.get<string>('TEMPERATURE')) || 0.3,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: this.configService.get<string>('AZURE_OPENAI_MODEL')
      };
    } catch (error) {
      this.logger.error('Error in AI analysis:', error);
      throw error;
    }
  }

  async getStatus() {
    const apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    const endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');
    const deployment = this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME');
    const model = this.configService.get<string>('AZURE_OPENAI_MODEL');

    return {
      configured: !!(apiKey && endpoint),
      hasApiKey: !!apiKey,
      hasEndpoint: !!endpoint,
      deployment: deployment || 'Not set',
      model: model || 'Not set',
      features: {
        enableAI: this.configService.get<string>('ENABLE_AI_ADVISORS') === 'true',
        enableFallback: this.configService.get<string>('ENABLE_FALLBACK_ANALYSIS') === 'true',
        enableCaching: this.configService.get<string>('ENABLE_AI_CACHING') === 'true'
      },
      timestamp: new Date().toISOString()
    };
  }
}
