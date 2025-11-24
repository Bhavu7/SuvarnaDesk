import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdWork,
  MdReceipt,
  MdCurrencyRupee,
  MdSettings,
  MdReport,
  MdPeople,
  MdClose,
  MdMenu,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

const links = [
  { to: "/", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/billing", label: "Billing", icon: <MdReceipt /> },
  { to: "/worker-jobs", label: "Worker Jobs", icon: <MdWork /> },
  { to: "/rates", label: "Rates", icon: <MdCurrencyRupee /> },
  { to: "/labour-charges", label: "Labour Charges", icon: <MdPeople /> },
  { to: "/reports", label: "Reports", icon: <MdReport /> },
  { to: "/settings", label: "Settings", icon: <MdSettings /> },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = true, // Default to collapsed
  mobileOpen = false,
  onClose,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const shouldExpand = isMobile ? mobileOpen : isHovered;
  const sidebarWidth = shouldExpand ? 256 : 80; // 64 for collapsed, 256 for expanded

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Hamburger Menu */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onToggle}
          className="fixed z-50 p-2 text-white bg-blue-600 rounded-lg shadow-lg top-4 left-4 lg:hidden hover:bg-blue-700"
          aria-label="Open menu"
        >
          <MdMenu className="text-2xl" />
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: mobileOpen || !isMobile ? 0 : -sidebarWidth,
        }}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`fixed lg:sticky top-0 flex flex-col min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl z-50 ${
          isMobile ? "lg:translate-x-0" : ""
        } transition-all duration-300 ease-in-out`}
        style={{ height: "100vh" }}
      >
        {/* Logo & Close Button */}
        <div
          className={`py-6 border-b border-blue-700 ${
            shouldExpand ? "px-6" : "px-4"
          } relative`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-white rounded-lg shadow-lg">
                  <MdReceipt className="text-2xl text-blue-600" />
                </div>
                <AnimatePresence>
                  {shouldExpand && (
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
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 text-white transition-colors rounded-lg lg:hidden hover:bg-blue-700"
                aria-label="Close sidebar"
              >
                <MdClose className="text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (isMobile && onClose) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                `flex items-center transition-all duration-300 group relative overflow-hidden ${
                  shouldExpand ? "px-6 py-4" : "justify-center px-4 py-4"
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
                      {shouldExpand && (
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
                  {!shouldExpand && (
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
