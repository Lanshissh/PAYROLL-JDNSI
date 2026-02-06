import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { runSandboxPayroll } from '../services/sandboxPayroll';

const router = Router();

/**
 * POST /payroll/sandbox
 * Role: Operator
 */
router.post('/sandbox', requireAuth, async (req, res) => {
  try {
    if (req.role !== 'operator') {
      return res.status(403).json({
        error: 'Only operators can run sandbox payroll'
      });
    }

    const { period_start, period_end } = req.body;

    if (!period_start || !period_end) {
      return res.status(400).json({
        error: 'period_start and period_end are required'
      });
    }

    const result = await runSandboxPayroll({
      companyId: req.companyId!,
      periodStart: period_start,
      periodEnd: period_end
    });

    return res.json({
      mode: 'sandbox',
      period_start,
      period_end,
      totals: {
        employees: result.summaries.length,
        gross: result.summaries.reduce((s, e) => s + e.gross_pay, 0),
        net: result.summaries.reduce((s, e) => s + e.net_pay, 0)
      },
      summaries: result.summaries,
      items: result.items
    });
  } catch (err: any) {
    console.error('sandbox payroll error', err);
    return res.status(400).json({ error: err.message });
  }
});

export default router;