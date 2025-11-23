import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function Sidebar() {
  return (
    <motion.nav
      className="flex flex-col w-64 bg-white border-r shadow-lg"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="p-6 text-2xl font-bold">SuvarnaDesk</div>
      <NavLink to="/billing" className="px-6 py-3 hover:bg-blue-100">
        Billing
      </NavLink>
      <NavLink to="/worker-jobs" className="px-6 py-3 hover:bg-blue-100">
        Worker Jobs
      </NavLink>
      <NavLink to="/rates" className="px-6 py-3 hover:bg-blue-100">
        Rates
      </NavLink>
      <NavLink to="/settings" className="px-6 py-3 hover:bg-blue-100">
        Settings
      </NavLink>
      <NavLink to="/profile" className="px-6 py-3 mt-auto hover:bg-blue-100">
        Profile
      </NavLink>
    </motion.nav>
  );
}
