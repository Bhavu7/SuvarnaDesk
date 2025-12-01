// components/Navbar.tsx - Add the missing imports and fix errors
import React, { useState, useRef, useEffect } from "react";
import {
  MdLogout,
  MdPerson,
  MdSettings,
  MdAccountCircle,
  MdSupervisorAccount, // Add this import
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../components/CustomToast";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  sidebarExpanded?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarExpanded = false }) => {
  const { logout, user, isSuperAdmin, adminStats } = useAuth(); // Add isSuperAdmin and adminStats
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const logoutConfirmRef = useRef<HTMLDivElement>(null);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    showToast.default("Logging out...");
    setTimeout(() => {
      logout();
    }, 1000);
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
    showToast.default("Logout cancelled");
  };

  const toggleProfile = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Navigation handlers
  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    navigate("/profile");
  };

  const handleSettings = () => {
    setShowProfileDropdown(false);
    navigate("/settings");
  };

  const handleAdminManagement = () => {
    setShowProfileDropdown(false);
    navigate("/admin-management");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
      if (
        logoutConfirmRef.current &&
        !logoutConfirmRef.current.contains(event.target as Node)
      ) {
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowProfileDropdown(false);
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <motion.div
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 flex items-center justify-between h-20 px-6 border-b border-gray-200 shadow-sm bg-white/95 backdrop-blur-md"
      >
        {/* Left Section - Show logo only when sidebar is collapsed */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {!sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-xl font-bold text-blue-600 lg:text-2xl">
                  SuvarnaDesk
                </span>
                <span className="hidden px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded md:inline">
                  v1.0
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleProfile}
              className={`flex items-center gap-2 p-1 rounded-lg transition-all duration-300 focus:outline-none focus:ring-0 ${
                showProfileDropdown ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              aria-label="Profile menu"
            >
              <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full shadow-md bg-gradient-to-r from-blue-500 to-purple-600">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 md:inline">
                {user?.name || "Admin"}
              </span>
            </motion.button>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 z-50 w-64 py-2 mt-2 border border-gray-200 shadow-xl bg-white/95 backdrop-blur-md rounded-xl"
                >
                  {/* Profile Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 text-lg font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {user?.name || "Admin"}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize truncate">
                          {user?.role || "Administrator"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email || "admin@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-2 py-2">
                    <button
                      onClick={handleViewProfile}
                      className="flex items-center w-full gap-2 px-3 py-3 text-sm text-left text-gray-700 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-0 hover:bg-gray-100/80"
                    >
                      <MdPerson className="text-lg" />
                      View Profile
                    </button>
                    <button
                      onClick={handleSettings}
                      className="flex items-center w-full gap-2 px-3 py-3 text-sm text-left text-gray-700 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-0 hover:bg-gray-100/80"
                    >
                      <MdSettings className="text-lg" />
                      Settings
                    </button>

                    {/* Admin Management Button (only for Super Admin) */}
                    {isSuperAdmin && (
                      <button
                        onClick={handleAdminManagement}
                        className="flex items-center w-full gap-2 px-3 py-3 text-sm text-left text-gray-700 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-0 hover:bg-gray-100/80"
                      >
                        <MdSupervisorAccount className="text-lg" />
                        Admin Management
                        {adminStats && (
                          <span className="px-2 py-1 ml-auto text-xs text-blue-800 bg-blue-100 rounded-full">
                            {adminStats.adminCount}/{adminStats.maxLimit}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="px-2 py-2 border-t border-gray-100">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogoutConfirm}
                      className="flex items-center w-full gap-2 px-3 py-3 text-sm text-red-600 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-0 hover:bg-red-50/80"
                    >
                      <MdLogout />
                      Logout
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              ref={logoutConfirmRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md mx-4"
            >
              <div className="p-6 bg-white border border-gray-200 shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                    <MdLogout className="text-2xl text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirm Logout
                    </h3>
                    <p className="text-sm text-gray-600">
                      Are you sure you want to logout?
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="p-4 mb-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-blue-600 rounded-full">
                      {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.name || "Admin"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                <div className="p-3 mb-6 text-sm text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50">
                  <p className="font-medium">
                    You will be signed out from your account.
                  </p>
                  <p className="mt-1">Any unsaved changes will be lost.</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelLogout}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg outline-none hover:bg-gray-200 focus:outline-none focus:ring-0"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg outline-none hover:bg-red-700 focus:outline-none focus:ring-0"
                  >
                    Yes, Logout
                  </motion.button>
                </div>

                {/* Close button */}
                <button
                  title="Close"
                  onClick={cancelLogout}
                  className="absolute text-gray-400 transition-colors outline-none top-4 right-4 hover:text-gray-600 focus:outline-none focus:ring-0"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
