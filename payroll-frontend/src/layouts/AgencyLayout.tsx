import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import './Layout.css';

export default function AgencyLayout() {
  const navigate = useNavigate();
  const { role } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar app-sidebar--agency">
        <div className="app-sidebar__brand">
          <h3>Agency Portal</h3>
          <span className="app-sidebar__role">Role: {role}</span>
        </div>

        <nav>
          <ul className="app-sidebar__nav">
            <li className="app-sidebar__link" onClick={() => navigate('/agency')}>
              Dashboard
            </li>
            <li className="app-sidebar__link">Employees</li>
            <li className="app-sidebar__link">Schedules</li>
            <li className="app-sidebar__link" onClick={() => navigate('/agency/leave')}>
              Leave Requests
            </li>
            <li className="app-sidebar__link">Logsheets</li>
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
