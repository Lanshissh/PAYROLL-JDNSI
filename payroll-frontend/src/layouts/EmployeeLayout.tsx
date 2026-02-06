import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import './Layout.css';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const { role } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="app-employee-shell">
      <header className="app-topbar">
        <h3>Employee Portal</h3>
        <div className="app-topbar__meta">
          <span className="app-topbar__role">Role: {role}</span>
          <button className="app-topbar__button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="app-subnav">
        <span className="app-subnav__link" onClick={() => navigate('/employee')}>
          Dashboard
        </span>
        <span className="app-subnav__link">Leave</span>
        <span className="app-subnav__link">Schedule</span>
        <span className="app-subnav__link" onClick={() => navigate('/employee/payslips')}>
          Payslips
        </span>
      </nav>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
