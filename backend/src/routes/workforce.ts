import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = Router();

/**
 * GET /workforce/employees
 * Employee directory
 *
 * Roles:
 * - Admin
 * - Operator
 * - Agency
 *
 * Salary & sensitive fields are protected by RLS
 */
router.get('/employees', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        employee_code,
        full_name,
        agency_id,
        status,
        created_at
      `)
      .order('full_name', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('workforce/employees error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /workforce/schedules
 * Employee schedules
 *
 * Roles:
 * - Admin
 * - Operator
 * - Agency
 * - Employee (self only via RLS)
 *
 * Query params:
 * - from (date)
 * - to (date)
 */
router.get('/schedules', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = supabase
      .from('employee_schedules')
      .select(`
        id,
        date,
        employee_id,
        shift_id,
        created_at
      `)
      .order('date', { ascending: true });

    if (from) {
      query = query.gte('date', from as string);
    }

    if (to) {
      query = query.lte('date', to as string);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('workforce/schedules error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /workforce/leaves
 * Leave requests
 *
 * Roles:
 * - Admin
 * - Operator
 * - Agency
 * - Employee (self only via RLS)
 */
router.get('/leaves', requireAuth, async (_req, res) => {
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
    console.error('workforce/leaves error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;