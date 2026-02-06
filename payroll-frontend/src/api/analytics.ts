import { supabase } from './client';

export async function getPayrollSummaryAnalytics() {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select(`
      id,
      payroll_run_id,
      dimensions,
      metrics,
      created_at
    `)
    .eq('snapshot_type', 'payroll_summary')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOTSummaryAnalytics() {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select(`
      id,
      dimensions,
      metrics,
      created_at
    `)
    .eq('snapshot_type', 'ot_summary')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAbsenceSummaryAnalytics() {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select(`
      id,
      dimensions,
      metrics,
      created_at
    `)
    .eq('snapshot_type', 'absence_summary')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}