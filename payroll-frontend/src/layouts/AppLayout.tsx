import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import "./layout.css";

export default function AppLayout() {
  return (
    <div className="appShell">
      <SideNav />
      <main className="appMain">
        <div className="appContent">
          <Outlet />
        </div>
      </main>
    </div>
  );
}