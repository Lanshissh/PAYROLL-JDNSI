import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '../pages/login/LoginPage';
import AdminDashboard from '../pages/admin/Dashboard';
import AgencyDashboard from '../pages/agency/Dashboard';
import EmployeeDashboard from '../pages/employee/Dashboard';
import LeavePage from '../pages/employee/LeavePage';
import LeaveApprovalPage from '../pages/agency/LeaveApprovalPage';
import PayrollPage from '../pages/admin/PayrollPage';
import PayrollApprovalPage from '../pages/admin/PayrollApprovalPage';
import PayrollLockPage from '../pages/admin/PayrollLockPage';
import PayslipsPage from '../pages/employee/PayslipsPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';

import RequireAuth from '../auth/RequireAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';

import AdminLayout from '../layouts/AdminLayout';
import AgencyLayout from '../layouts/AgencyLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />
  },

  // ADMIN / OPERATOR / BILLING / FINANCE
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <ProtectedRoute allow={['admin', 'operator', 'billing', 'finance']}>
          <AdminLayout />
        </ProtectedRoute>
      </RequireAuth>
    ),
    children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'payroll', element: <PayrollPage /> },
        { path: 'payroll-approvals', element: <PayrollApprovalPage /> },
        { path: 'payroll-lock', element: <PayrollLockPage /> },
        { path: 'analytics', element: <AnalyticsPage /> }
    ]
  },

  // AGENCY
  {
    path: '/agency',
    element: (
      <RequireAuth>
        <ProtectedRoute allow={['agency']}>
          <AgencyLayout />
        </ProtectedRoute>
      </RequireAuth>
    ),
    children: [
        { index: true, element: <AgencyDashboard /> },
        { path: 'leave', element: <LeaveApprovalPage /> }
    ]
  },

  // EMPLOYEE
  {
    path: '/employee',
    element: (
      <RequireAuth>
        <ProtectedRoute allow={['employee']}>
          <EmployeeLayout />
        </ProtectedRoute>
      </RequireAuth>
    ),
    // EMPLOYEE
    children: [
        { index: true, element: <EmployeeDashboard /> },
        { path: 'leave', element: <LeavePage /> },
        { path: 'payslips', element: <PayslipsPage /> }
    ]
  }
]);