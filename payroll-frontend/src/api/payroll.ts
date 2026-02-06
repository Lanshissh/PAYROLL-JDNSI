import { supabase } from './client';

export async function getPayrollRuns() {
  const { data, error } = await supabase
    .from('payroll_runs')
    .select(`
      id,
      period_start,
      period_end,
      status,
      is_sandbox,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPayrollRun(payload: {
  period_start: string;
  period_end: string;
  is_sandbox: boolean;
}) {
  const { error } = await supabase.from('payroll_runs').insert(payload);
  if (error) throw error;
}

export async function getPayrollForApproval() {
  const { data, error } = await supabase
    .from('payroll_runs')
    .select(`
      id,
      period_start,
      period_end,
      status,
      is_sandbox,
      created_at
    `)
    .neq('status', 'draft')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function acknowledgePayroll(payrollRunId: string) {
  const { error } = await supabase
    .from('payroll_acknowledgments')
    .insert({
      payroll_run_id: payrollRunId
    });

  if (error) throw error;
}

export async function approvePayroll(payrollRunId: string) {
  const { error } = await supabase
    .rpc('approve_payroll_run', { payroll_run_id: payrollRunId });

  if (error) throw error;
}

export async function lockPayroll(payrollRunId: string) {
  const { error } = await supabase
    .rpc('lock_payroll_run', { payroll_run_id: payrollRunId });

  if (error) throw error;
}

export async function releasePayslips(payrollRunId: string) {
  const { error } = await supabase
    .rpc('release_payslips', { payroll_run_id: payrollRunId });

  if (error) throw error;
}
