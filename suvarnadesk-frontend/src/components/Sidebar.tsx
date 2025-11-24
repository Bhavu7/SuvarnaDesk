import React from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdWork,
  MdMoney,
  MdList,
  MdSettings,
  MdReport,
  MdPeople,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  collapsed?: boolean;
}

const links = [
  { to: "/", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/billing", label: "Billing", icon: <MdMoney /> },
  { to: "/worker-jobs", label: "Worker Jobs", icon: <MdWork /> },
  { to: "/rates", label: "Rates", icon: <MdList /> },
  { to: "/labour-charges", label: "Labour Charges", icon: <MdPeople /> },
  { to: "/reports", label: "Reports", icon: <MdReport /> },
  { to: "/settings", label: "Settings", icon: <MdSettings /> },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => (
  <motion.aside
    initial={{ x: -64, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className={`flex-col min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl ${
      collapsed ? "w-20" : "w-64"
    } transition-all duration-300`}
  >
    {/* Logo */}
    <div
      className={`py-6 border-b border-blue-700 ${collapsed ? "px-4" : "px-6"}`}
    >
      <div className="flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-white rounded-lg">
            <MdMoney className="text-2xl text-blue-600" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden text-xl font-bold text-white whitespace-nowrap"
              >
                SuvarnaDesk
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>

    {/* Navigation Links */}
    <nav className="flex-1 py-6">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center transition-all duration-200 group relative ${
              collapsed ? "justify-center px-4 py-4" : "px-6 py-4"
            } ${
              isActive
                ? "bg-blue-700 text-white shadow-lg"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`${
                  isActive ? "text-white" : "text-blue-300"
                } text-xl`}
              >
                {icon}
              </motion.div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 font-medium whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute z-50 px-2 py-1 ml-2 text-sm text-white transition-opacity duration-200 bg-gray-900 rounded opacity-0 left-full group-hover:opacity-100 whitespace-nowrap">
                  {label}
                </div>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  </motion.aside>
);

export default Sidebar;
