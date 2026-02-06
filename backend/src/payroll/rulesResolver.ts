import { RuleSet } from './types';

export function applyRounding(
  value: number,
  ruleSet: RuleSet
): number {
  switch (ruleSet.rounding) {
    case 'floor':
      return Math.floor(value * 100) / 100;
    case 'ceil':
      return Math.ceil(value * 100) / 100;
    case 'exact':
    default:
      return Math.round(value * 100) / 100;
  }
}