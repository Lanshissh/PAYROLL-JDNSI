import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import AppLayout from "../layouts/AppLayout";

function Dashboard() {
  return <div className="text-slate-900 text-xl font-semibold">Dashboard</div>;
}
function Employees() {
  return <div className="text-slate-900 text-xl font-semibold">Employees</div>;
}
function Payroll() {
  return <div className="text-slate-900 text-xl font-semibold">Payroll</div>;
}
function Reports() {
  return <div className="text-slate-900 text-xl font-semibold">Reports</div>;
}
function Settings() {
  return <div className="text-slate-900 text-xl font-semibold">Settings</div>;
}

export default function App() {
  const isAuthed = !!localStorage.getItem("auth_token");

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LoginPage />} />

      {/* Protected app shell */}
      <Route element={isAuthed ? <AppLayout /> : <Navigate to="/" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}