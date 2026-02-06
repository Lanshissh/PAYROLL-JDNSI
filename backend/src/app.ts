import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { requireAuth } from './middleware/auth';
import { requestContext } from './middleware/requestContext';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

import payrollRoutes from './routes/payroll';
import attendanceRoutes from './routes/attendance';
import workforceRoutes from './routes/workforce';
import documentRoutes from './routes/documents';
import payrollSandboxRoutes from './routes/payrollSandbox';
import leaveRoutes from './routes/leave';
import analyticsRoutes from './routes/analytics';

const app = express();

app.use(cors());
app.use(express.json());

// ✅ tracing + logging first
app.use(requestContext);
app.use(requestLogger);

// ✅ global rate limit (basic protection)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// ✅ stricter payroll limit (critical endpoints)
app.use(
  '/payroll',
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// routes
app.use('/payroll', payrollRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/workforce', workforceRoutes);
app.use('/documents', documentRoutes);
app.use('/payroll', payrollSandboxRoutes);
app.use('/leave', leaveRoutes);
app.use('/analytics', analyticsRoutes);

// health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// identity debug (auth required)
app.get('/me', requireAuth, (req, res) => {
  res.json({
    userId: req.user?.id,
    role: req.role,
    companyId: req.companyId,
    agencyId: req.agencyId,
    employeeId: req.employeeId
  });
});

// ✅ must be last
app.use(errorHandler);

export default app;
