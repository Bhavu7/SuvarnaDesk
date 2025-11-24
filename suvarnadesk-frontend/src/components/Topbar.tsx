import React from "react";
import { MdMenu, MdPerson, MdNotifications } from "react-icons/md";
import { motion } from "framer-motion";

interface TopbarProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
  unreadCount?: number;
}

const Topbar: React.FC<TopbarProps> = ({
  onMenuClick,
  onNotificationsClick,
  unreadCount = 0,
}) => (
  <div className="sticky top-0 z-40 flex items-center justify-between px-4 bg-white border-b shadow-sm md:hidden h-14">
    <button
      type="button"
      onClick={onMenuClick}
      className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
      title="Open menu"
      aria-label="Open menu"
    >
      <MdMenu className="text-xl" />
    </button>

    <span className="text-lg font-bold text-blue-700">SuvarnaDesk</span>

    <div className="flex items-center gap-3">
      {/* Notifications for mobile */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNotificationsClick}
        className="relative p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        aria-label="Notifications"
      >
        <MdNotifications className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full -top-1 -right-1">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <span className="flex items-center gap-1 text-gray-700">
        <MdPerson className="text-lg" />
        <span className="text-sm">Admin</span>
      </span>
    </div>
  </div>
);

export default Topbar;
