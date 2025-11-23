import React from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdWork,
  MdMoney,
  MdList,
  MdSettings,
  MdReport,
} from "react-icons/md";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/billing", label: "Billing", icon: <MdMoney /> },
  { to: "/worker-jobs", label: "Worker Jobs", icon: <MdWork /> },
  { to: "/rates", label: "Rates", icon: <MdList /> },
  { to: "/labour-charges", label: "Labour Charges", icon: <MdMoney /> },
  { to: "/reports", label: "Reports", icon: <MdReport /> },
  { to: "/settings", label: "Settings", icon: <MdSettings /> },
];

const Sidebar = () => (
  <motion.aside
    initial={{ x: -64, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="flex-col hidden w-64 min-h-screen bg-white border-r shadow-lg md:flex"
  >
    <div className="py-6 text-2xl font-bold text-center text-blue-700 border-b">
      SuvarnaDesk
    </div>
    {links.map(({ to, label, icon }) => (
      <NavLink
        key={to}
        to={to}
        className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-blue-100"
        style={({ isActive }) =>
          isActive ? { background: "#dbeafe", fontWeight: "bold" } : undefined
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    ))}
  </motion.aside>
);

export default Sidebar;
