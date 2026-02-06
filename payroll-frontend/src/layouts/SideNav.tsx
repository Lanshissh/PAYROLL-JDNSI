import { NavLink, useNavigate } from "react-router-dom";
import "./layout.css";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Employees", to: "/employees" },
  { label: "Payroll", to: "/payroll" },
  { label: "Reports", to: "/reports" },
  { label: "Settings", to: "/settings" },
];

export default function SideNav() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  return (
    <aside className="sideNav">
      <div className="sideNavHeader">
        <div className="brandTitle">Payroll System</div>
        <div className="brandSub">Admin Panel</div>
      </div>

      <nav className="sideNavLinks">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "navLink navLinkActive" : "navLink"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sideNavFooter">
        <button className="logoutBtn" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}