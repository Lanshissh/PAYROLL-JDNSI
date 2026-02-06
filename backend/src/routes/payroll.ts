import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';
import { runPayrollSnapshot } from '../workers/payrollSnapshotWorker';

const router = Router();

/**
 * POST /payroll/runs
 * Role: Operator
 */
router.post('/runs', requireAuth, async (req, res) => {
  try {
    // 1️⃣ Role enforcement (API-level guard)
    if (req.role !== 'operator') {
      return res.status(403).json({ error: 'Only operators can create payroll runs' });
    }

    const { company_id, period_start, period_end, type } = req.body;

    // 2️⃣ Basic validation (keep it minimal)
    if (!company_id || !period_start || !period_end) {
      return res.status(400).json({
        error: 'company_id, period_start, and period_end are required'
      });
    }

    // Optional: type defaults to 'regular'
    const payrollType = type ?? 'regular';

    // 3️⃣ Insert payroll run (DB enforces uniqueness & RLS)
    const { data, error } = await supabase
      .from('payroll_runs')
      .insert({
        company_id,
        period_start,
        period_end,
        type: payrollType,
        status: 'draft',
        created_by: req.user?.id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      payroll_run: data
    });
  } catch (err) {
    console.error('Create payroll run error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /payroll/:id/snapshot
 * Role: Operator
 */
router.post('/:id/snapshot', requireAuth, async (req, res) => {
  try {
    // 1️⃣ Role enforcement
    if (req.role !== 'operator') {
      return res.status(403).json({
        error: 'Only operators can snapshot payroll'
      });
    }

    const payrollRunId = req.params.id;

    // 2️⃣ Load payroll run (RLS enforced)
    const { data: payroll, error } = await supabase
      .from('payroll_runs')
      .select('id, period_start, period_end, status')
      .eq('id', payrollRunId)
      .single();

    if (error || !payroll) {
      return res.status(404).json({ error: 'Payroll run not found' });
    }

    if (payroll.status !== 'draft') {
      return res.status(409).json({
        error: `Cannot snapshot payroll in status: ${payroll.status}`
      });
    }

    // 3️⃣ Run snapshot worker (service-role inside)
    await runPayrollSnapshot({
      payrollRunId: payroll.id,
      periodStart: payroll.period_start,
      periodEnd: payroll.period_end
    });

    return res.status(200).json({
      success: true,
      payroll_run_id: payroll.id,
      message: 'Attendance successfully snapshotted'
    });
  } catch (err: any) {
    console.error('Payroll snapshot error:', err.message);

    return res.status(400).json({
      error: err.message ?? 'Snapshot failed'
    });
  }
});

/**
 * POST /payroll/:id/submit
 * Role: Operator
 */
router.post('/:id/submit', requireAuth, async (req, res) => {
  if (req.role !== 'operator') {
    return res.status(403).json({ error: 'Only operators can submit payroll' });
  }

  const payrollRunId = req.params.id;

  const { error } = await supabase
    .from('payroll_runs')
    .update({ status: 'operator_submitted' })
    .eq('id', payrollRunId);

  if (error) {
    return res.status(409).json({ error: error.message });
  }

  return res.json({ success: true });
});

/**
 * POST /payroll/:id/acknowledge
 * Role: Billing | Agency | Finance
 */
router.post('/:id/acknowledge', requireAuth, async (req, res) => {
  const allowedRoles = ['billing', 'agency', 'finance'];

  if (!allowedRoles.includes(req.role!)) {
    return res.status(403).json({ error: 'Role not allowed to acknowledge payroll' });
  }

  const payrollRunId = req.params.id;

  const { error } = await supabase
    .from('payroll_acknowledgments')
    .insert({
      payroll_run_id: payrollRunId,
      role: req.role,
      acknowledged_by: req.user?.id
    });

  if (error) {
    return res.status(409).json({ error: error.message });
  }

  return res.json({ success: true });
});

/**
 * POST /payroll/:id/approve
 * Role: Billing | Agency | Finance
 */
router.post('/:id/approve', requireAuth, async (req, res) => {
  const allowedRoles = ['billing', 'agency', 'finance'];

  if (!allowedRoles.includes(req.role!)) {
    return res.status(403).json({ error: 'Role not allowed to approve payroll' });
  }

  const payrollRunId = req.params.id;

  const { error } = await supabase
    .from('approval_history')
    .insert({
      payroll_run_id: payrollRunId,
      role: req.role,
      approved_by: req.user?.id
    });

  if (error) {
    return res.status(409).json({ error: error.message });
  }

  return res.json({ success: true });
});

/**
 * POST /payroll/:id/lock
 * Role: Finance
 */
router.post('/:id/lock', requireAuth, async (req, res) => {
  if (req.role !== 'finance') {
    return res.status(403).json({ error: 'Only finance can lock payroll' });
  }

  const payrollRunId = req.params.id;

  const { error } = await supabase
    .from('payroll_runs')
    .update({ status: 'locked' })
    .eq('id', payrollRunId);

  if (error) {
    return res.status(409).json({ error: error.message });
  }

  return res.json({ success: true });
});

/**
 * POST /payroll/:id/adjustments
 * Role: Finance, Admin
 */
router.post('/:id/adjustments', requireAuth, async (req, res) => {
  try {
    if (!['finance', 'admin'].includes(req.role!)) {
      return res.status(403).json({
        error: 'Only finance or admin can create payroll adjustments'
      });
    }

    const payrollRunId = req.params.id;
    const { employee_id, amount, reason } = req.body;

    if (!employee_id || amount === undefined || !reason) {
      return res.status(400).json({
        error: 'employee_id, amount, and reason are required'
      });
    }

    // Ensure payroll is locked
    const { data: payroll, error: payrollError } = await supabase
      .from('payroll_runs')
      .select('status')
      .eq('id', payrollRunId)
      .single();

    if (payrollError || !payroll) {
      return res.status(404).json({ error: 'Payroll run not found' });
    }

    if (payroll.status !== 'locked') {
      return res.status(409).json({
        error: 'Adjustments are allowed only after payroll is locked'
      });
    }

    // Insert adjustment (DB enforces immutability)
    const { data, error } = await supabase
      .from('payroll_adjustments')
      .insert({
        payroll_run_id: payrollRunId,
        employee_id,
        amount,
        reason,
        created_by: req.user?.id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      adjustment: data
    });
  } catch (err) {
    console.error('payroll adjustment error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /payroll/:id/adjustments
 * Roles: Admin, Finance, Agency
 */
router.get('/:id/adjustments', requireAuth, async (req, res) => {
  try {
    const payrollRunId = req.params.id;

    const { data, error } = await supabase
      .from('payroll_adjustments')
      .select('*')
      .eq('payroll_run_id', payrollRunId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('get payroll adjustments error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;