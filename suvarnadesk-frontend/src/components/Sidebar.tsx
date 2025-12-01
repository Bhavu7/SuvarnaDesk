import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdReceipt,
  MdCurrencyRupee,
  MdSettings,
  MdPeople,
  MdClose,
  MdMenu,
  MdBuildCircle,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  onDesktopExpand?: (expanded: boolean) => void;
}

const links = [
  { to: "/", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/billing", label: "Billing", icon: <MdReceipt /> },
  { to: "/manage-customers", label: "Manage Customers", icon: <MdPeople /> },
  { to: "/rates", label: "Live Rates", icon: <MdCurrencyRupee /> },
  { to: "/repairings", label: "AC Receipt", icon: <MdBuildCircle /> },
  { to: "/settings", label: "Settings", icon: <MdSettings /> },
];

// Custom SVG logo
const SuvarnaDeskSvgIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="16"
      y="16"
      width="88"
      height="88"
      rx="18"
      stroke="currentColor"
      strokeWidth="3"
    />
    <line
      x1="26"
      y1="90"
      x2="94"
      y2="90"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.7"
    />
    <rect
      x="32"
      y="64"
      width="10"
      height="26"
      rx="4"
      fill="url(#goldGradient)"
    />
    <rect
      x="52"
      y="54"
      width="10"
      height="36"
      rx="4"
      fill="url(#silverGradient)"
    />
    <rect x="72" y="42" width="10" height="48" rx="4" fill="currentColor" />
    <path
      d="M30 78 L44 70 L58 64 L72 56 L86 52"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.8"
    />
    <polygon points="86,52 92,49 88,57" fill="currentColor" opacity="0.8" />
    <circle
      cx="44"
      cy="46"
      r="7"
      stroke="url(#goldGradient)"
      strokeWidth="3"
      fill="none"
    />
    <circle
      cx="54"
      cy="40"
      r="7"
      stroke="url(#silverGradient)"
      strokeWidth="3"
      fill="none"
    />
    <text x="66" y="45" fontSize="12" fontWeight="600" fill="currentColor">
      ₹
    </text>
    <defs>
      <linearGradient id="goldGradient" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#B7791F" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#FACC15" />
      </linearGradient>
      <linearGradient id="silverGradient" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#6B7280" />
        <stop offset="50%" stopColor="#9CA3AF" />
        <stop offset="100%" stopColor="#E5E7EB" />
      </linearGradient>
    </defs>
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = true,
  mobileOpen = false,
  onClose,
  onToggle,
  onDesktopExpand,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const shouldExpand = isMobile ? mobileOpen : isHovered;
  const sidebarWidth = shouldExpand ? 280 : 80;

  useEffect(() => {
    if (!isMobile && onDesktopExpand) {
      onDesktopExpand(shouldExpand);
    }
  }, [shouldExpand, isMobile, onDesktopExpand]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Hamburger */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onToggle}
          className="fixed z-50 p-2 text-white bg-blue-600 rounded-lg shadow-lg top-4 left-4 lg:hidden hover:bg-blue-700 focus:outline-none focus:ring-0"
          aria-label="Open menu"
        >
          <MdMenu className="text-2xl" />
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{
          type: "tween",
          duration: 0.25,
          ease: "easeInOut",
        }}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`fixed lg:sticky top-0 left-0 flex flex-col min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl z-50 ${
          isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"
        } transition-transform duration-300 ease-in-out`}
        style={{ height: "100vh" }}
      >
        {/* Logo Row */}
        <div className={`py-5 border-b border-blue-700 px-4 relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-lg">
                  <SuvarnaDeskSvgIcon className="text-2xl text-blue-600" />
                </div>
                <AnimatePresence mode="wait">
                  {shouldExpand && (
                    <motion.div
                      key="expanded-logo"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xl font-bold text-white whitespace-nowrap">
                        SuvarnaDesk
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md whitespace-nowrap">
                        v1.0
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 text-white transition-colors rounded-lg lg:hidden hover:bg-blue-700 focus:outline-none focus:ring-0"
                aria-label="Close sidebar"
              >
                <MdClose className="text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (isMobile && onClose) onClose();
              }}
              className={({ isActive }) =>
                [
                  "group relative flex items-center mx-3 my-2 px-3 py-3 rounded-xl overflow-hidden transition-all duration-200",
                  isActive
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-sm",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500"
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.15 }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center w-full">
                    {/* Icon: fixed position, never changes justify */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      className={`text-xl flex-shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-blue-300 group-hover:text-white"
                      }`}
                    >
                      {icon}
                    </motion.div>

                    {/* Label: appears when expanded, doesn't push icon left */}
                    <AnimatePresence mode="wait">
                      {shouldExpand && (
                        <motion.span
                          key={`text-${to}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="ml-4 font-medium whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tooltip in collapsed mode */}
                  {!shouldExpand && (
                    <div className="absolute z-50 px-3 py-2 ml-2 text-sm text-white transition-opacity duration-150 -translate-y-1/2 bg-gray-900 rounded-lg shadow-lg opacity-0 pointer-events-none left-full top-1/2 whitespace-nowrap group-hover:opacity-100">
                      {label}
                      <div className="absolute -translate-y-1/2 border-4 border-transparent right-full top-1/2 border-r-gray-900" />
                    </div>
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
