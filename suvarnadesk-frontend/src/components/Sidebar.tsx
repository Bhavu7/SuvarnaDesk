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
  onDesktopExpand?: (expanded: boolean) => void;
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

// Your Custom SVG Icon Component
const SuvarnaDeskSvgIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* <!-- Outer frame --> */}
    <rect
      x="16"
      y="16"
      width="88"
      height="88"
      rx="18"
      stroke="currentColor"
      strokeWidth="3"
    />

    {/* <!-- Base line --> */}
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

    {/* <!-- Bars --> */}
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

    {/* <!-- Line chart --> */}
    <path
      d="M30 78 L44 70 L58 64 L72 56 L86 52"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.8"
    />

    {/* <!-- Arrow head --> */}
    <polygon points="86,52 92,49 88,57" fill="currentColor" opacity="0.8" />

    {/* <!-- Rings --> */}
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

    {/* <!-- Rupee symbol --> */}
    <text x="66" y="45" fontSize="12" fontWeight="600" fill="currentColor">
      ₹
    </text>

    {/* <!-- Gradients --> */}
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
  const sidebarWidth = shouldExpand ? 280 : 80; // Increased from 256 to 280

  // Notify parent when desktop sidebar expands/collapses
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
          className={`py-5 border-b border-blue-700 ${
            shouldExpand ? "px-6" : "px-4"
          } relative`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 gap-3">
              <motion.div
                // whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-white rounded-lg shadow-lg">
                  <SuvarnaDeskSvgIcon className="text-2xl text-blue-600" />
                </div>
                <AnimatePresence>
                  {shouldExpand && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center gap-3 overflow-hidden"
                    >
                      <span className="text-xl font-bold text-white whitespace-nowrap">
                        SuvarnaDesk
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md whitespace-nowrap">
                        {" "}
                        {/* Added whitespace-nowrap and increased padding */}
                        v1.0
                      </span>
                    </motion.div>
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
