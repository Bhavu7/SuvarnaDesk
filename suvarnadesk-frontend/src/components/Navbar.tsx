import React, { useState, useRef, useEffect } from "react";
import { MdLogout, MdPerson, MdNotifications, MdEmail } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../components/CustomToast";

const Navbar = () => {
  const { logout, user } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Enhanced notifications data
  const notifications = [
    {
      id: 1,
      type: "invoice",
      message: "New invoice created successfully",
      time: "2 min ago",
      read: false,
      priority: "high",
    },
    {
      id: 2,
      type: "job",
      message: "Worker job completed by Rajesh",
      time: "1 hour ago",
      read: true,
      priority: "medium",
    },
    {
      id: 3,
      type: "rate",
      message: "Gold rates updated to ₹5,800/g",
      time: "3 hours ago",
      read: true,
      priority: "medium",
    },
    {
      id: 4,
      type: "payment",
      message: "Payment of ₹15,000 received from Priya",
      time: "5 hours ago",
      read: false,
      priority: "high",
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter(
    (n) => n.priority === "high" && !n.read
  ).length;

  const handleLogout = () => {
    showToast.default("Logging out...");
    setTimeout(() => {
      logout();
    }, 1000);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileDropdown(false);
  };

  const toggleProfile = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotifications(false);
  };

  const markAsRead = (id: number) => {
    showToast.success("Notification marked as read");
    // In real app, update notification status via API
  };

  const markAllAsRead = () => {
    showToast.success("All notifications marked as read");
    // In real app, update all notifications status via API
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <motion.div
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 border-b border-gray-200 shadow-sm bg-white/95 backdrop-blur-md"
    >
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-600 lg:text-2xl">
          SuvarnaDesk
        </span>
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
            onClick={toggleNotifications}
            className={`relative p-2 rounded-full transition-all duration-300 ${
              showNotifications
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Notifications"
          >
            <MdNotifications className="text-xl" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute flex items-center justify-center text-xs font-medium text-white rounded-full -top-1 -right-1 ${
                  highPriorityCount > 0
                    ? "w-5 h-5 bg-red-500"
                    : "w-4 h-4 bg-orange-500"
                }`}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 z-50 py-2 mt-2 border border-gray-200 shadow-xl w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-xl"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 text-sm text-blue-600">
                        ({unreadCount} new)
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-96">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80 cursor-pointer transition-colors group ${
                          !notification.read ? "bg-blue-50/50" : ""
                        } ${
                          notification.priority === "high"
                            ? "border-l-4 border-l-red-500"
                            : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  notification.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {notification.priority === "high"
                                  ? "High Priority"
                                  : "Medium Priority"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 ml-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <MdNotifications className="mx-auto mb-2 text-3xl text-gray-300" />
                      <p>No notifications</p>
                      <p className="mt-1 text-sm">You're all caught up!</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={() => (window.location.href = "/notifications")}
                    className="w-full py-2 text-sm text-center text-blue-600 transition-colors hover:text-blue-700"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleProfile}
            className={`flex items-center gap-2 p-1 rounded-lg transition-all duration-300 ${
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
                    onClick={() => (window.location.href = "/profile")}
                    className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-700 transition-colors duration-200 rounded-lg hover:bg-gray-100/80"
                  >
                    <MdPerson className="text-lg" />
                    View Profile
                  </button>
                  <button
                    onClick={() => (window.location.href = "/settings")}
                    className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-700 transition-colors duration-200 rounded-lg hover:bg-gray-100/80"
                  >
                    <MdEmail className="text-lg" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="px-2 py-2 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50/80"
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
