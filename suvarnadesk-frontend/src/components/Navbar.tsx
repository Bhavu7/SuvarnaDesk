import React, { useState, useRef, useEffect } from "react";
import {
  MdLogout,
  MdPerson,
  MdNotifications,
  MdEmail,
  MdPhone,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { logout, user } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const notifications = [
    { id: 1, message: "New invoice created", time: "2 min ago", read: false },
    { id: 2, message: "Worker job completed", time: "1 hour ago", read: true },
    { id: 3, message: "Metal rates updated", time: "3 hours ago", read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
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
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm md:px-8"
    >
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-blue-600">SuvarnaDesk</span>
        <span className="hidden px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded md:inline">
          v1.0
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
            className="relative p-2 text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <MdNotifications className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full -top-1 -right-1">
                {unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 z-50 py-2 mt-2 bg-white border border-gray-200 shadow-lg w-80 rounded-xl"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>

                {notifications.length > 0 ? (
                  <div className="overflow-y-auto max-h-60">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="text-sm text-gray-800">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <MdNotifications className="mx-auto mb-2 text-3xl text-gray-300" />
                    <p>No notifications</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
            className="flex items-center gap-2 p-1 transition-colors rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-gray-900">
                {user?.name || "Admin"}
              </span>
              <span className="block text-xs text-gray-500">
                {user?.role || "Administrator"}
              </span>
            </div>
          </motion.button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 z-50 w-64 py-2 mt-2 bg-white border border-gray-200 shadow-lg rounded-xl"
              >
                {/* Profile Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                      {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {user?.name || "Super Admin"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {user?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MdEmail className="text-gray-400" />
                      <span>{user?.email || "admin@example.com"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MdPhone className="text-gray-400" />
                      <span>{user?.phone || "+91 1234567890"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-2 py-2">
                  <button
                    onClick={() => (window.location.href = "/profile")}
                    className="w-full px-3 py-2 text-sm text-left text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => (window.location.href = "/settings")}
                    className="w-full px-3 py-2 text-sm text-left text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="px-2 py-2 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-600 transition-colors rounded-lg hover:bg-red-50"
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
  );
};

export default Navbar;
