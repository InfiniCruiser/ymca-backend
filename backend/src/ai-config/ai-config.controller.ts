import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiConfigService } from './ai-config.service';

@Controller('ai-config')
export class AiConfigController {
  constructor(private readonly aiConfigService: AiConfigService) {}

  @Get()
  async getConfig() {
    try {
      const config = await this.aiConfigService.getConfig();
      return {
        success: true,
        config: config,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Failed to load AI configuration',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('analysis')
  async generateAnalysis(@Body() body: { prompt: any; context: any }) {
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
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
          fallback: true
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status')
  async getStatus() {
    try {
      const status = await this.aiConfigService.getStatus();
      return {
        success: true,
        status: status
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Failed to get AI status'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
