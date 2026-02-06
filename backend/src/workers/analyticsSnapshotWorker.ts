import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function generateAnalyticsSnapshots(
  payrollRunId: string
) {
  const { data: payrollRun } = await supabaseAdmin
    .from('payroll_runs')
    .select('id, company_id, status, period_start, period_end')
    .eq('id', payrollRunId)
    .single();

  if (!payrollRun || payrollRun.status !== 'locked') {
    throw new Error('Payroll run must be locked');
  }

  const { period_start, period_end, company_id } = payrollRun;

  const { data: payables } = await supabaseAdmin
    .from('attendance_payables')
    .select(`
      employee_id,
      overtime_minutes,
      payroll_amount
    `)
    .eq('payroll_run_id', payrollRunId);

  const employeeSet = new Set<string>();
  let totalOTMinutes = 0;
  let totalOTCost = 0;

  for (const row of payables ?? []) {
    employeeSet.add(row.employee_id);
    totalOTMinutes += Number(row.overtime_minutes || 0);
    totalOTCost += Number(row.payroll_amount || 0);
  }

  // --- OT SUMMARY ---
  await supabaseAdmin.from('analytics_snapshots').upsert({
    company_id,
    payroll_run_id: payrollRunId,
    snapshot_type: 'ot_summary',
    dimensions: { period_start, period_end },
    metrics: {
      total_ot_hours: totalOTMinutes / 60,
      total_ot_cost: totalOTCost
    }
  }, { onConflict: 'payroll_run_id,snapshot_type' });

  // --- ABSENCE SUMMARY ---
  const { data: leaveDays } = await supabaseAdmin
    .from('attendance_days')
    .select('source, employee_id')
    .eq('source', 'leave')
    .gte('work_date', period_start)
    .lte('work_date', period_end);

  let paidLeave = 0;
  let unpaidLeave = 0;

  for (const row of leaveDays ?? []) {
    paidLeave++; // unpaid leave days were skipped earlier
  }

  const absenceRate =
    employeeSet.size === 0
      ? 0
      : paidLeave / employeeSet.size;

  await supabaseAdmin.from('analytics_snapshots').upsert({
    company_id,
    payroll_run_id: payrollRunId,
    snapshot_type: 'absence_summary',
    dimensions: { period_start, period_end },
    metrics: {
      paid_leave_days: paidLeave,
      unpaid_leave_days: unpaidLeave,
      absence_rate: absenceRate
    }
  }, { onConflict: 'payroll_run_id,snapshot_type' });
}
