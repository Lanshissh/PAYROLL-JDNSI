import { supabase } from './client';

export async function getMyLeaves() {
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      id,
      leave_type,
      start_date,
      end_date,
      is_paid,
      status,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createLeave(payload: {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}) {
  const { error } = await supabase.from('leave_requests').insert(payload);
  if (error) throw error;
}

export async function getAgencyPendingLeaves() {
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      id,
      leave_type,
      start_date,
      end_date,
      status,
      employees (
        full_name
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function approveLeave(
  leaveId: string,
  action: 'approve' | 'reject',
  remarks?: string
) {
  // update leave_requests
  const { error } = await supabase
    .from('leave_requests')
    .update({ status: action === 'approve' ? 'approved' : 'rejected' })
    .eq('id', leaveId);

  if (error) throw error;

  // insert approval history
  await supabase.from('leave_approvals').insert({
    leave_request_id: leaveId,
    action,
    remarks
  });
}
