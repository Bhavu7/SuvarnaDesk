import React from "react";
import { motion } from "framer-motion";
import { MdDashboard } from "react-icons/md";

const Dashboard = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="flex items-center gap-3 mb-6">
      <MdDashboard className="text-3xl text-blue-500" />
      <h2 className="text-2xl font-bold">Dashboard</h2>
    </div>
    <div className="p-6 bg-white rounded shadow">
      <p>
        Welcome to SuvarnaDesk. See all key metrics, info and quick links here.
      </p>
    </div>
  </motion.div>
);

export default Dashboard;
