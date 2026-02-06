import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function runPayrollSnapshot({
  payrollRunId,
  periodStart,
  periodEnd
}: {
  payrollRunId: string;
  periodStart: string;
  periodEnd: string;
}) {
  // 1️⃣ Validate payroll run
  const { data: payroll, error: payrollError } = await supabaseAdmin
    .from('payroll_runs')
    .select('id, status')
    .eq('id', payrollRunId)
    .single();

  if (payrollError || !payroll) {
    throw new Error('Payroll run not found');
  }

  if (payroll.status !== 'draft') {
    throw new Error(`Cannot snapshot payroll in status: ${payroll.status}`);
  }

  // 2️⃣ Ensure snapshot not already created (idempotency)
  const { count } = await supabaseAdmin
    .from('attendance_payables')
    .select('*', { count: 'exact', head: true })
    .eq('payroll_run_id', payrollRunId);

  if ((count ?? 0) > 0) {
    throw new Error('Payroll snapshot already exists');
  }

  // 3️⃣ Insert snapshot (single SQL operation)
  const { error: insertError } = await supabaseAdmin.rpc(
    'snapshot_attendance_into_payroll',
    {
      p_payroll_run_id: payrollRunId,
      p_period_start: periodStart,
      p_period_end: periodEnd
    }
  );

  if (insertError) {
    throw new Error(`Snapshot failed: ${insertError.message}`);
  }

  return {
    success: true,
    payrollRunId
  };
}