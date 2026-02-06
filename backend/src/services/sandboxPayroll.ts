import { supabase } from '../lib/supabaseClient';
import { resolveRuleSet } from '../rules/rulesResolver';
import { calculatePayroll } from '../payroll/calculator';
import { PayrollOutput } from '../payroll/types';

/**
 * Compute sandbox payroll for a date range.
 * Read-only. No DB writes.
 */
export async function runSandboxPayroll(params: {
  companyId: string;
  periodStart: string;
  periodEnd: string;
}): Promise<PayrollOutput> {
  const { companyId, periodStart, periodEnd } = params;

  // 1️⃣ Load normalized attendance
  const { data: attendance, error: aErr } = await supabase
    .from('attendance_days')
    .select('*')
    .gte('work_date', periodStart)
    .lte('work_date', periodEnd);

  if (aErr || !attendance) {
    throw new Error(aErr?.message ?? 'Failed to load attendance');
  }

  // 2️⃣ Resolve rules (use periodStart as anchor date)
  const ruleSet = await resolveRuleSet(companyId, periodStart);

  // 3️⃣ Load employee rates (latest effective per employee)
  // NOTE: simple version — assumes one active rate per employee
  const { data: ratesRows, error: rErr } = await supabase
    .from('employee_rate_history')
    .select(`
      employee_id,
      hourly_rate,
      overtime_multiplier,
      night_diff_multiplier,
      holiday_multiplier,
      rest_day_multiplier
    `)
    .lte('effective_from', periodEnd)
    .or(`effective_to.is.null,effective_to.gte.${periodStart}`);

  if (rErr || !ratesRows) {
    throw new Error(rErr?.message ?? 'Failed to load rates');
  }

  const rates = Object.fromEntries(
    ratesRows.map(r => [r.employee_id, r])
  );

  // 4️⃣ Run calculator (sandbox mode)
  return calculatePayroll({
    mode: 'sandbox',
    attendance,
    rates,
    ruleSet
  });
}