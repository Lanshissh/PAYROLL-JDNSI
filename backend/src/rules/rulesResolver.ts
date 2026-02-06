import { supabaseAdmin } from '../lib/supabaseAdmin';
import { RuleSetResolved, RoundingPolicy } from './ruleTypes';

/**
 * Resolve the correct rule set for a given company + date.
 *
 * RULES:
 * - Latest effective_from <= date
 * - effective_to is NULL OR >= date
 * - Never mutates DB
 * - Throws if no rule set is found (fail fast)
 */
export async function resolveRuleSet(
  companyId: string,
  payrollDate: string
): Promise<RuleSetResolved> {
  /**
   * 1️⃣ Find applicable rule_set
   */
  const { data: ruleSet, error: ruleSetError } = await supabaseAdmin
    .from('rule_sets')
    .select('id, effective_from')
    .eq('company_id', companyId)
    .lte('effective_from', payrollDate)
    .or(`effective_to.is.null,effective_to.gte.${payrollDate}`)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single();

  if (ruleSetError || !ruleSet) {
    throw new Error(
      `No rule set found for company ${companyId} on ${payrollDate}`
    );
  }

  /**
   * 2️⃣ Load pay_rules for the rule_set
   */
  const { data: rules, error: rulesError } = await supabaseAdmin
    .from('pay_rules')
    .select('rule_key, rule_value')
    .eq('rule_set_id', ruleSet.id);

  if (rulesError || !rules) {
    throw new Error(`Failed to load rules for rule_set ${ruleSet.id}`);
  }

  /**
   * 3️⃣ Normalize rules into a key/value map
   */
  const ruleMap: Record<string, number | string> = {};

  for (const rule of rules) {
    ruleMap[rule.rule_key] = rule.rule_value;
  }

  /**
   * 4️⃣ Apply defaults + validation
   * (IMPORTANT: calculator must never receive undefined values)
   */
  const roundingPolicy = (
    ruleMap.rounding_policy ?? 'exact'
  ) as RoundingPolicy;

  if (!['exact', 'floor', 'ceil'].includes(roundingPolicy)) {
    throw new Error(`Invalid rounding_policy: ${roundingPolicy}`);
  }

  /**
   * 5️⃣ Return fully-resolved rule set
   */
  return {
    id: ruleSet.id,
    effective_from: ruleSet.effective_from,

    rounding: roundingPolicy,

    hourly_rate: Number(ruleMap.hourly_rate ?? 0),
    ot_multiplier: Number(ruleMap.ot_multiplier ?? 1),
    night_diff_multiplier: Number(ruleMap.night_diff_multiplier ?? 0),
    holiday_multiplier: Number(ruleMap.holiday_multiplier ?? 1),
    rest_day_multiplier: Number(ruleMap.rest_day_multiplier ?? 1),

    ot_threshold_minutes: Number(ruleMap.ot_threshold_minutes ?? 0)
  };
}