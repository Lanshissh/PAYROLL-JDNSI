import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { generatePayslip } from '../services/payslipService';
import { supabase } from '../lib/supabaseClient';

const router = Router();

/**
 * POST /documents/payroll/:id/payslips
 * Generate payslips for a payroll run
 *
 * Roles: Finance, Admin
 */
router.post('/payroll/:id/payslips', requireAuth, async (req, res) => {
  try {
    if (!['finance', 'admin'].includes(req.role!)) {
      return res.status(403).json({
        error: 'Only finance or admin can generate payslips'
      });
    }

    const rawId = req.params.id;

    if (Array.isArray(rawId)) {
      return res.status(400).json({ error: 'Invalid payroll run id' });
    }

    const payrollRunId: string = rawId;

    const result = await generatePayslip({
      payrollRunId,
      generatedBy: req.user!.id
    });

    return res.status(201).json({
      success: true,
      generated: result.count
    });
  } catch (err: any) {
    console.error('generate payslips error', err);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /documents/payslips
 * Employee self-service payslip list
 */
router.get('/payslips', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('type', 'payslip')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json(data);
});

export default router;