import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-black text-white min-h-screen">
      <div className="p-5 text-xl font-bold text-purple-400">
        Garments ERP
      </div>

      <nav className="space-y-1 px-3">
        {[
          "Dashboard",
          "Order Management",
          "Manage Accessories",
          "Users List",
          "Accounts",
          "Party List",
          "Employees",
          "Due List",
          "Loss Profit",
          "Reports",
          "Roles & Permissions",
          "Settings"
        ].map((item) => (
          <NavLink
            key={item}
            to="#"
            className="block px-4 py-2 rounded hover:bg-purple-600"
          >
            {item}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
