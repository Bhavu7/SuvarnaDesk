import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MdDashboard,
  MdPeople,
  MdReceipt,
  MdWork,
  MdTrendingUp,
  MdAccountBalanceWallet,
  MdShoppingCart,
  MdCalendarToday,
} from "react-icons/md";
import {
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
  AreaChart,
  Area,
} from "recharts";
import apiClient from "../api/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";

// Define types for chart data
interface ChartDataItem {
  name: string;
  revenue: number;
  invoices: number;
  customers: number;
  jobs: number;
}

interface Stats {
  customers: number;
  invoices: number;
  workerJobs: number;
  revenue: number;
  activeJobs: number;
  pendingInvoices: number;
}

interface RecentActivity {
  id: number;
  action: string;
  customer: string;
  amount: string;
  time: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    customers: 0,
    invoices: 0,
    workerJobs: 0,
    revenue: 0,
    activeJobs: 0,
    pendingInvoices: 0,
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
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

        const activeJobs = jobsRes.data.filter(
          (job: any) => job.status === "inProgress"
        ).length;

        const pendingInvoices = invoicesRes.data.filter(
          (invoice: any) => invoice.paymentDetails?.balanceDue > 0
        ).length;

        setStats({
          customers,
          invoices,
          workerJobs,
          revenue,
          activeJobs,
          pendingInvoices,
        });

        // Enhanced mock chart data
        const mockData: ChartDataItem[] = [
          { name: "Jan", revenue: 42000, invoices: 24, customers: 18, jobs: 8 },
          { name: "Feb", revenue: 38000, invoices: 19, customers: 15, jobs: 6 },
          {
            name: "Mar",
            revenue: 45000,
            invoices: 28,
            customers: 22,
            jobs: 12,
          },
          {
            name: "Apr",
            revenue: 52000,
            invoices: 32,
            customers: 25,
            jobs: 15,
          },
          {
            name: "May",
            revenue: 48000,
            invoices: 29,
            customers: 23,
            jobs: 11,
          },
          {
            name: "Jun",
            revenue: 55000,
            invoices: 35,
            customers: 28,
            jobs: 18,
          },
          {
            name: "Jul",
            revenue: 61000,
            invoices: 38,
            customers: 31,
            jobs: 20,
          },
        ];

        setChartData(mockData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Customers",
      value: stats.customers,
      icon: <MdPeople className="text-2xl" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      change: "+12%",
      description: "Active customers",
    },
    {
      title: "Total Invoices",
      value: stats.invoices,
      icon: <MdReceipt className="text-2xl" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      change: "+8%",
      description: "This month",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <MdWork className="text-2xl" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      change: "+5%",
      description: "In progress",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: <MdAccountBalanceWallet className="text-2xl" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      change: "+15%",
      description: "Lifetime",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices,
      icon: <MdShoppingCart className="text-2xl" />,
      color: "bg-gradient-to-r from-red-500 to-red-600",
      change: "-3%",
      description: "Unpaid",
    },
    {
      title: "Worker Jobs",
      value: stats.workerJobs,
      icon: <MdCalendarToday className="text-2xl" />,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      change: "+7%",
      description: "All time",
    },
  ];

  // Simple pie chart data - using Record<string, any> to avoid TypeScript issues
  const pieChartData: Record<string, any>[] = [
    { name: "Gold", value: 65 },
    { name: "Silver", value: 25 },
    { name: "Platinum", value: 8 },
    { name: "Other", value: 2 },
  ];

  // Colors for pie chart segments
  const COLORS = ["#FFD700", "#C0C0C0", "#E5E4E2", "#8884D8"];

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      action: "New Invoice",
      customer: "Rajesh Kumar",
      amount: "₹15,240",
      time: "2 min ago",
    },
    {
      id: 2,
      action: "Job Completed",
      customer: "Priya Sharma",
      amount: "₹8,500",
      time: "1 hour ago",
    },
    {
      id: 3,
      action: "Payment Received",
      customer: "Amit Patel",
      amount: "₹12,000",
      time: "3 hours ago",
    },
    {
      id: 4,
      action: "New Customer",
      customer: "Sneha Reddy",
      amount: "-",
      time: "5 hours ago",
    },
  ];

  // Safe label formatter for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    if (!percent) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <MdDashboard className="text-2xl text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-600">
              Welcome to your jewelry shop management system
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors focus:outline-none focus:ring-0 ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-4 transition-shadow bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 truncate">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MdTrendingUp className="text-xs text-green-600" />
                  <span className="text-xs text-green-600">{stat.change}</span>
                  <span className="text-xs text-gray-500 truncate">
                    {stat.description}
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-xl text-white ${stat.color} group-hover:scale-110 transition-transform flex-shrink-0 ml-2`}
              >
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Revenue Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0088FE"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Business Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Business Metrics
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="invoices" fill="#00C49F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="customers" fill="#8884D8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="jobs" fill="#FF8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Metal Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Metal Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Percentage"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl lg:col-span-2"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Recent Activities
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">{activity.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {activity.amount}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Avg. Invoice Value", value: "₹12,450", change: "+5%" },
            { label: "Customer Growth", value: "18%", change: "+2%" },
            { label: "Job Completion", value: "94%", change: "+3%" },
            { label: "Revenue Growth", value: "22%", change: "+7%" },
          ].map((metric, index) => (
            <div
              key={metric.label}
              className="p-4 text-center rounded-lg bg-gray-50"
            >
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {metric.value}
              </p>
              <p className="text-xs text-green-600">{metric.change}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
