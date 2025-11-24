import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MdDashboard,
  MdPeople,
  MdReceipt,
  MdWork,
  MdTrendingUp,
  MdAccountBalanceWallet,
} from "react-icons/md";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiClient from "../api/apiClient";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    invoices: 0,
    workerJobs: 0,
    revenue: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // You'll need to create these endpoints in your backend
        const [customersRes, invoicesRes, jobsRes] = await Promise.all([
          apiClient.get("/customers"),
          apiClient.get("/invoices"),
          apiClient.get("/worker-jobs"),
        ]);

        const customers = customersRes.data.length;
        const invoices = invoicesRes.data.length;
        const workerJobs = jobsRes.data.length;
        const revenue = invoicesRes.data.reduce(
          (sum: number, invoice: any) =>
            sum + (invoice.totals?.grandTotal || 0),
          0
        );

        setStats({ customers, invoices, workerJobs, revenue });

        // Mock chart data - replace with actual data from your backend
        // setChartData([
        //   { name: "Jan", revenue: 4000, invoices: 24 },
        //   { name: "Feb", revenue: 3000, invoices: 13 },
        //   { name: "Mar", revenue: 2000, invoices: 18 },
        //   { name: "Apr", revenue: 2780, invoices: 29 },
        //   { name: "May", revenue: 1890, invoices: 19 },
        //   { name: "Jun", revenue: 2390, invoices: 25 },
        // ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Customers",
      value: stats.customers,
      icon: <MdPeople className="text-2xl" />,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Invoices",
      value: stats.invoices,
      icon: <MdReceipt className="text-2xl" />,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Active Jobs",
      value: stats.workerJobs,
      icon: <MdWork className="text-2xl" />,
      color: "bg-purple-500",
      change: "+5%",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: <MdAccountBalanceWallet className="text-2xl" />,
      color: "bg-orange-500",
      change: "+15%",
    },
  ];

  const pieData = [
    { name: "Gold", value: 400 },
    { name: "Silver", value: 300 },
    { name: "Other", value: 300 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <MdDashboard className="text-3xl text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-green-600">
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ fill: "#0088FE", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Invoices Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Invoices Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="invoices" fill="#00C49F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Metal Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl lg:col-span-1"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Metal Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl lg:col-span-2"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "New Invoice",
                icon: "📝",
                color: "bg-blue-100 text-blue-600",
              },
              {
                label: "Add Customer",
                icon: "👥",
                color: "bg-green-100 text-green-600",
              },
              {
                label: "Create Job",
                icon: "🔧",
                color: "bg-purple-100 text-purple-600",
              },
              {
                label: "View Reports",
                icon: "📊",
                color: "bg-orange-100 text-orange-600",
              },
            ].map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-lg ${action.color} text-center hover:shadow-md transition-all`}
              >
                <div className="mb-2 text-2xl">{action.icon}</div>
                <div className="text-sm font-medium">{action.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
