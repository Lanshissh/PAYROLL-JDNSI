import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/auth';

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

app.use('/payroll', payrollRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/workforce', workforceRoutes);
app.use('/documents', documentRoutes);
app.use('/payroll', payrollSandboxRoutes);
app.use('/leave', leaveRoutes);
app.use('/analytics', analyticsRoutes);


app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/me', requireAuth, (req, res) => {
  res.json({
    userId: req.user?.id,
    role: req.role,
    companyId: req.companyId,
    agencyId: req.agencyId,
    employeeId: req.employeeId
  });
});

export default app;
