import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = Router();

/**
 * GET /analytics/payroll-summary
 *
 * Query params:
 * - period_start (optional)
 * - period_end (optional)
 */
router.get('/payroll-summary', requireAuth, async (req, res) => {
  try {
    // Block employees explicitly
    if (req.role === 'employee') {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const { period_start, period_end } = req.query;

    let query = supabase
      .from('analytics_snapshots')
      .select(`
        id,
        payroll_run_id,
        snapshot_type,
        dimensions,
        metrics,
        created_at
      `)
      .eq('snapshot_type', 'payroll_summary')
      .order('created_at', { ascending: false });

    if (period_start) {
      query = query.gte(
        'dimensions->>period_start',
        String(period_start)
      );
    }

    if (period_end) {
      query = query.lte(
        'dimensions->>period_end',
        String(period_end)
      );
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      count: data?.length || 0,
      results: data
    });
  } catch (err) {
    console.error('analytics payroll-summary error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/overtime', requireAuth, async (req, res) => {
  if (req.role === 'employee') {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('snapshot_type', 'ot_summary')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ count: data.length, results: data });
});

router.get('/absence', requireAuth, async (req, res) => {
  if (req.role === 'employee') {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('snapshot_type', 'absence_summary')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ count: data.length, results: data });
});

export default router;