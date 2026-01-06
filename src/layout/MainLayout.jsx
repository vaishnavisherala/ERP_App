import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../components/sidebar.css";

export default function MainLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="main">
        {/* Topbar (mobile) */}
        <div className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}>
            ☰
          </button>
          <span className="top-title">Garments ERP</span>
        </div>

        {/* Page Content */}
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
