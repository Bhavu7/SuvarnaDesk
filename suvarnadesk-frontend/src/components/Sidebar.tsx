import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Billing", path: "/billing" },
  { label: "Worker Jobs", path: "/worker-jobs" },
  { label: "Rates", path: "/rates" },
  { label: "Labour Charges", path: "/labour-charges" },
  { label: "Reports", path: "/reports" },
  { label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r hidden md:block">
      <nav className="flex flex-col p-4 space-y-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded hover:bg-gray-100 ${
              location.pathname.startsWith(item.path)
                ? "bg-gray-200 font-semibold"
                : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
