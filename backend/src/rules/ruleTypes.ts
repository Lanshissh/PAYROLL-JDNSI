/**
 * Resolved rule set passed into the payroll calculator.
 * This is the FINAL, normalized shape.
 *
 * IMPORTANT:
 * - No DB types here
 * - No optional fields
 * - Defaults applied before returning
 */

export type RoundingPolicy = 'exact' | 'floor' | 'ceil';

export interface RuleSetResolved {
  /** rule_sets.id */
  id: string;

  /** versioning / audit */
  effective_from?: string;

  /** rounding policy */
  rounding: RoundingPolicy;

  /** pay multipliers */
  hourly_rate: number;
  ot_multiplier: number;
  night_diff_multiplier: number;
  holiday_multiplier: number;
  rest_day_multiplier: number;

  /** thresholds */
  ot_threshold_minutes: number;
}