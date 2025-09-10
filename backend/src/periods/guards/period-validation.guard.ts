import { Injectable, CanActivate, ExecutionContext, BadRequestException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PeriodsService } from '../periods.service';

export const PERIOD_VALIDATION_KEY = 'periodValidation';
export const PeriodValidation = (required: boolean = true) => 
  SetMetadata(PERIOD_VALIDATION_KEY, required);

@Injectable()
export class PeriodValidationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private periodsService: PeriodsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPeriodValidationRequired = this.reflector.getAllAndOverride<boolean>(
      PERIOD_VALIDATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isPeriodValidationRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const periodId = this.extractPeriodId(request);

    if (!periodId) {
      throw new BadRequestException('Period ID is required for this operation.');
    }

    const canAccessPeriod = await this.periodsService.validatePeriodAccess(periodId);
    if (!canAccessPeriod) {
      throw new BadRequestException(`Period ${periodId} is not currently accepting submissions or reviews.`);
    }

    return true;
  }

  private extractPeriodId(request: any): string | null {
    // Try to get periodId from different sources
    return (
      request.query?.periodId ||
      request.body?.periodId ||
      request.params?.periodId ||
      null
    );
  }
}
