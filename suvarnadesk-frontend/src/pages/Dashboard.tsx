import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdDashboard } from "react-icons/md";
import apiClient from "../api/apiClient";

const Dashboard = () => {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    apiClient.get("/api/admin/dashboard").then((res) => setStats(res.data));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <MdDashboard className="text-3xl text-blue-500" />
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 p-6 bg-white rounded shadow md:grid-cols-3">
        <div>
          <div className="text-xl font-bold">{stats?.customers ?? 0}</div>
          <div className="text-gray-600">Customers</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats?.invoices ?? 0}</div>
          <div className="text-gray-600">Invoices</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats?.workerJobs ?? 0}</div>
          <div className="text-gray-600">Worker Jobs</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
