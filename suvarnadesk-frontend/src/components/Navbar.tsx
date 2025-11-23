import React from "react";
import { MdLogout, MdPerson } from "react-icons/md";
import { motion } from "framer-motion";

const Navbar = () => (
  <motion.div
    initial={{ y: -32, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm md:px-8"
  >
    <span className="text-2xl font-bold text-blue-600">SuvarnaDesk</span>
    <div className="flex items-center gap-4">
      <MdPerson className="text-2xl" />
      <span className="hidden sm:inline">Admin</span>
      <button className="flex items-center gap-1 px-3 py-2 text-white transition-colors bg-red-500 rounded hover:bg-red-700">
        <MdLogout />
        Logout
      </button>
    </div>
  </motion.div>
);

export default Navbar;
