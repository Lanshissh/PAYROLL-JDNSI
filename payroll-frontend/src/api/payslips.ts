import { supabase } from './client';

export async function getMyPayslips() {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      id,
      payroll_run_id,
      created_at,
      file_url
    `)
    .eq('document_type', 'payslip')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}