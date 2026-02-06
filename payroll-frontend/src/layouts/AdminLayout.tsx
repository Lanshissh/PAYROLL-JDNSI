import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import './Layout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { role } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <h3>Payroll System</h3>
          <span className="app-sidebar__role">Role: {role}</span>
        </div>

        <nav>
          <ul className="app-sidebar__nav">
            <li className="app-sidebar__link" onClick={() => navigate('/admin')}>
              Dashboard
            </li>
            <li className="app-sidebar__link" onClick={() => navigate('/admin/payroll')}>
              Payroll
            </li>
            <li
              className="app-sidebar__link"
              onClick={() => navigate('/admin/payroll-approvals')}
            >
              Payroll Approvals
            </li>
            <li className="app-sidebar__link" onClick={() => navigate('/admin/payroll-lock')}>
              Lock & Payslips
            </li>
            <li className="app-sidebar__link" onClick={() => navigate('/admin/analytics')}>
              Analytics
            </li>
            <li className="app-sidebar__link">Employees</li>
          </ul>
        </nav>

        <div className="app-sidebar__footer">
          <button className="app-sidebar__button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
