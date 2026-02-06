import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = Router();

/**
 * GET /attendance/logs
 * Roles:
 * - Admin
 * - Operator
 * - Agency
 * - Employee (self only via RLS)
 *
 * Query params:
 * - employee_id (optional)
 * - from (ISO date/time)
 * - to (ISO date/time)
 */
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const { employee_id, from, to } = req.query;

    let query = supabase
      .from('attendance_logs')
      .select('*')
      .order('punch_time', { ascending: true });

    if (employee_id) {
      query = query.eq('employee_id', employee_id as string);
    }

    if (from) {
      query = query.gte('punch_time', from as string);
    }

    if (to) {
      query = query.lte('punch_time', to as string);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('attendance/logs error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /attendance/days
 * Normalized attendance (attendance_days)
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
router.get('/days', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = supabase
      .from('attendance_days')
      .select('*')
      .order('work_date', { ascending: true });

    if (from) {
      query = query.gte('work_date', from as string);
    }

    if (to) {
      query = query.lte('work_date', to as string);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('attendance/days error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /attendance/segments
 * Attendance day segments (optional but useful for audits)
 */
router.get('/segments', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = supabase
      .from('attendance_day_segments')
      .select('*')
      .order('start_time', { ascending: true });

    if (from) {
      query = query.gte('work_date', from as string);
    }

    if (to) {
      query = query.lte('work_date', to as string);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('attendance/segments error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;