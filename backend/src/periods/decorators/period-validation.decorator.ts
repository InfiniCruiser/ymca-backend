import { SetMetadata } from '@nestjs/common';

export const PERIOD_VALIDATION_KEY = 'periodValidation';

/**
 * Decorator to mark endpoints that require period validation
 * @param required - Whether period validation is required (default: true)
 */
export const PeriodValidation = (required: boolean = true) => 
  SetMetadata(PERIOD_VALIDATION_KEY, required);

/**
 * Decorator to mark endpoints that require active period validation
 * This ensures the period is currently accepting submissions
 */
export const RequireActivePeriod = () => PeriodValidation(true);

/**
 * Decorator to mark endpoints that don't require period validation
 * Useful for endpoints that work with historical data
 */
export const SkipPeriodValidation = () => PeriodValidation(false);
