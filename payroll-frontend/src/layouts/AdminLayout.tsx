import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { role } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: '#1e293b',
          color: '#fff',
          padding: 16
        }}
      >
        <h3>Payroll System</h3>
        <p style={{ fontSize: 12, opacity: 0.7 }}>Role: {role}</p>

        <nav style={{ marginTop: 24 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: 12, cursor: 'pointer' }}
                onClick={() => navigate('/admin')}>
              Dashboard
            </li>

            <li style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate('/admin/payroll')} >
                Payroll
            </li>

            <li style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate('/admin/payroll-approvals')}>
                Payroll Approvals
            </li>
            
            <li style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate('/admin/payroll-lock')}>
                Lock & Payslips
            </li>

            <li style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate('/admin/analytics')}>
                Analytics
            </li>

            <li style={{ marginBottom: 12, cursor: 'pointer' }}>
              Employees
            </li>
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 24,
            padding: '8px 12px',
            width: '100%'
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}