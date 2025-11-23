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
  { path: "/", label: "Dashboard", icon: <MdDashboard /> },
  { path: "/billing", label: "Billing", icon: <MdMoney /> },
  { path: "/worker-jobs", label: "Worker Jobs", icon: <MdWork /> },
  { path: "/rates", label: "Rates", icon: <MdList /> },
  { path: "/labour-charges", label: "Labour Charges", icon: <MdMoney /> },
  { path: "/reports", label: "Reports", icon: <MdReport /> },
  { path: "/settings", label: "Settings", icon: <MdSettings /> },
];

const Sidebar = () => (
  <motion.div
    initial={{ x: -80, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="flex-col hidden w-64 min-h-screen bg-white border-r shadow-lg md:flex"
  >
    <div className="py-6 text-2xl font-bold text-center text-blue-600 border-b">
      SuvarnaDesk
    </div>
    {links.map(({ path, label, icon }) => (
      <NavLink
        key={path}
        to={path}
        className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-blue-100"
        activeClassName="bg-blue-200 font-bold"
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    ))}
  </motion.div>
);

export default Sidebar;
