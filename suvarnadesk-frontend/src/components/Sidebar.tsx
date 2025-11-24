import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdWork,
  MdMoney,
  MdList,
  MdSettings,
  MdReport,
  MdPeople,
  MdClose,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  mobileOpen = false,
  onClose,
}) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={onClose}
            />
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: mobileOpen ? 0 : collapsed ? 0 : -320,
          opacity: mobileOpen ? 1 : 1,
        }}
        className={`fixed lg:sticky top-0 flex flex-col min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl z-50 ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } 
        transition-all duration-300 ease-in-out`}
        style={{ height: "100vh" }}
      >
        {/* Logo & Close Button */}
        <div
          className={`py-6 border-b border-blue-700 ${
            collapsed ? "px-4" : "px-6"
          } relative`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-white rounded-lg shadow-lg">
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

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-2 text-white transition-colors rounded-lg lg:hidden hover:bg-blue-700"
              aria-label="Close sidebar"
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                `flex items-center transition-all duration-300 group relative overflow-hidden ${
                  collapsed ? "justify-center px-4 py-4" : "px-6 py-4"
                } ${
                  isActive
                    ? "bg-blue-700 text-white shadow-lg"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated Background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 ${
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`${
                        isActive
                          ? "text-white"
                          : "text-blue-300 group-hover:text-white"
                      } text-xl transition-colors duration-300`}
                    >
                      {icon}
                    </motion.div>

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-4 font-medium transition-all duration-300 whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute z-50 px-3 py-2 ml-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg opacity-0 pointer-events-none left-full whitespace-nowrap"
                    >
                      {label}
                      {/* Tooltip arrow */}
                      <div className="absolute transform -translate-y-1/2 border-4 border-transparent right-full top-1/2 border-r-gray-900" />
                    </motion.div>
                  )}

                  {/* Active indicator */}
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute w-2 h-2 bg-white rounded-full right-4"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;
