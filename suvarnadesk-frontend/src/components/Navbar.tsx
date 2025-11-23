import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.div
      className="flex items-center justify-between h-16 px-8 bg-white border-b"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span className="text-xl font-bold">SuvarnaDesk</span>
      <div className="flex items-center gap-4">
        <span>Admin</span>
        <Link to="/login">
          <button className="px-4 py-2 text-white transition bg-red-500 rounded hover:bg-red-700">
            Logout
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
