import React from "react";
import { MdLogout, MdPerson, MdNotifications } from "react-icons/md";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <motion.div
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm md:px-8"
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-blue-600">SuvarnaDesk</span>
        <span className="hidden px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded md:inline">
          v1.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          title="Notifications"
          className="p-2 text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <MdNotifications className="text-xl" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <MdPerson className="text-blue-600" />
          </div>
          <div className="hidden text-right sm:block">
            <span className="block text-sm font-medium text-gray-900">
              {user?.name || "Admin"}
            </span>
            <span className="block text-xs text-gray-500">
              {user?.email || "admin@example.com"}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
        >
          <MdLogout />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Navbar;
