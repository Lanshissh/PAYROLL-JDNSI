import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

/**
 * POST /leave
 * Employee files a leave request (self only)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.role !== 'employee') {
      return res.status(403).json({ error: 'Only employees can file leave requests' });
    }

    const { start_date, end_date, leave_type, is_paid, reason } = req.body;

    if (!start_date || !end_date || !leave_type) {
      return res.status(400).json({
        error: 'start_date, end_date, and leave_type are required'
      });
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: req.employeeId,
        company_id: req.companyId,
        agency_id: req.agencyId,

        leave_type,
        start_date,
        end_date,
        is_paid: !!is_paid,

        status: 'pending',
        reason,
        created_by: req.user!.id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('leave create error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /leave
 * RLS handles visibility
 */
router.get('/', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('leave fetch error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/approve', requireAuth, async (req, res) => {
  try {
    if (!['agency', 'admin'].includes(req.role!)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const leaveId = req.params.id;

    // 1️⃣ LOAD THE LEAVE REQUEST
    const { data: leave, error: leaveError } = await supabaseAdmin
      .from('leave_requests')
      .select('id, start_date, end_date, status')
      .eq('id', leaveId)
      .single();

    if (leaveError || !leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // 2️⃣ 🚨 PAYROLL LOCK GUARD (PUT IT HERE)
    const { data: lockedPayroll } = await supabaseAdmin
      .from('payroll_runs')
      .select('id')
      .eq('status', 'locked')
      .lte('period_start', leave.start_date)
      .gte('period_end', leave.end_date)
      .maybeSingle();

    if (lockedPayroll) {
      return res.status(409).json({
        error: 'Payroll is locked for this period. Create a payroll adjustment.'
      });
    }

    // 3️⃣ APPROVE THE LEAVE (SAFE NOW)
    await supabaseAdmin
      .from('leave_requests')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', leaveId);

    // 4️⃣ WRITE APPROVAL AUDIT
    await supabaseAdmin
      .from('leave_approvals')
      .insert({
        leave_request_id: leaveId,
        action: 'approved',
        acted_by: req.user!.id,
        role: req.role
      });

    return res.json({ success: true });
  } catch (err) {
    console.error('leave approve error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /leave/:id/reject
 */
router.post('/:id/reject', requireAuth, async (req, res) => {
  try {
    if (!['agency', 'admin'].includes(req.role!)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const leaveId = req.params.id;
    const { remarks } = req.body;

    await supabase.from('leave_requests')
      .update({ status: 'rejected' })
      .eq('id', leaveId);

    await supabase.from('leave_approvals').insert({
      leave_request_id: leaveId,
      action: 'rejected',
      acted_by: req.user!.id,
      role: req.role,
      remarks
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('leave reject error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
