import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function AgencyLayout() {
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
          background: '#0f766e',
          color: '#fff',
          padding: 16
        }}
      >
        <h3>Agency Portal</h3>
        <p style={{ fontSize: 12, opacity: 0.8 }}>Role: {role}</p>

        <nav style={{ marginTop: 24 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => navigate('/agency')}
            >
              Dashboard
            </li>

            <li style={{ marginBottom: 12 }}>
              Employees
            </li>

            <li style={{ marginBottom: 12 }}>
              Schedules
            </li>

            <li style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate('/agency/leave')}>
                Leave Requests
            </li>

            <li style={{ marginBottom: 12 }}>
              Logsheets
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