import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const { role } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: '#2563eb',
          color: '#fff'
        }}
      >
        <h3>Employee Portal</h3>
        <div>
          <span style={{ marginRight: 12, fontSize: 12 }}>
            Role: {role}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 10px',
              background: '#1e40af',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          gap: 16,
          padding: '12px 20px',
          background: '#e5e7eb'
        }}
      >
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/employee')}
        >
          Dashboard
        </span>

        <span style={{ cursor: 'pointer' }}>
          Leave
        </span>

        <span style={{ cursor: 'pointer' }}>
          Schedule
        </span>

        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/payslips')}>
            Payslips
        </span>
      </nav>

      {/* Main Content */}
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}