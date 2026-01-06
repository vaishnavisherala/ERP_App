import { NavLink } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <h2 className="logo">Garments ERP</h2>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/order">Order</NavLink>
        <NavLink to="/stock">Stock</NavLink>
        <NavLink to="/cutting">Cutting</NavLink>
        <NavLink to="/stitching">Stitching</NavLink>
        <NavLink to="/trimming">Trimming</NavLink>
        <NavLink to="/pressing">Pressing</NavLink>
        <NavLink to="/dispatch">Dispatch</NavLink>
      </nav>

      {/* Close button (mobile only) */}
      <button className="close-btn" onClick={() => setOpen(false)}>
        ✕
      </button>
    </aside>
  );
}
