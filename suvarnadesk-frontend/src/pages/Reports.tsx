import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MdBarChart,
  MdDownload,
  MdCalendarToday,
  MdAttachMoney,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { showToast } from "../components/CustomToast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Mock data for reports
  const salesData = [
    { name: "Jan", revenue: 4000, invoices: 24, customers: 18 },
    { name: "Feb", revenue: 3000, invoices: 13, customers: 12 },
    { name: "Mar", revenue: 2000, invoices: 18, customers: 15 },
    { name: "Apr", revenue: 2780, invoices: 29, customers: 22 },
    { name: "May", revenue: 1890, invoices: 19, customers: 16 },
    { name: "Jun", revenue: 2390, invoices: 25, customers: 20 },
  ];

  const metalDistribution = [
    { name: "Gold", value: 65 },
    { name: "Silver", value: 25 },
    { name: "Other", value: 10 },
  ];

  const paymentMethods = [
    { name: "Cash", value: 45 },
    { name: "UPI", value: 30 },
    { name: "Card", value: 20 },
    { name: "Bank Transfer", value: 5 },
  ];

  const topCustomers = [
    { name: "Rajesh Kumar", purchases: 12, amount: 125000 },
    { name: "Priya Sharma", purchases: 8, amount: 98000 },
    { name: "Amit Patel", purchases: 6, amount: 75000 },
    { name: "Sneha Reddy", purchases: 5, amount: 62000 },
    { name: "Vikram Singh", purchases: 4, amount: 55000 },
  ];

  const exportReport = (type: string) => {
    showToast.success(`${type} report exported successfully!`);
    // In real implementation, this would generate and download the report
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <MdBarChart className="text-2xl text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Reports & Analytics
            </h2>
            <p className="text-gray-600">
              Comprehensive business insights and analytics
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              aria-label="Start date for report"
            />
            <span className="flex items-center text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              aria-label="End date for report"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => exportReport("PDF")}
            className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            aria-label="Export PDF report"
          >
            <MdDownload className="text-lg" />
            Export PDF
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Revenue",
            value: "₹1,89,240",
            change: "+15%",
            icon: <MdAttachMoney />,
            color: "bg-green-500",
          },
          {
            title: "Total Invoices",
            value: "128",
            change: "+8%",
            icon: <MdBarChart />,
            color: "bg-blue-500",
          },
          {
            title: "New Customers",
            value: "42",
            change: "+12%",
            icon: <MdCalendarToday />,
            color: "bg-purple-500",
          },
          {
            title: "Active Jobs",
            value: "18",
            change: "+5%",
            icon: <MdBarChart />,
            color: "bg-orange-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
                  {stat.change} from last period
                </p>
              </div>
              <div className={`p-3 rounded-xl text-white ${stat.color}`}>
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
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
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

        {/* Invoice Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Invoice Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
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
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Metal Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={metalDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {metalDistribution.map((entry, index) => (
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

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Payment Methods
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={paymentMethods}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentMethods.map((entry, index) => (
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

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Top Customers
          </h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-500">
                    {customer.purchases} purchases
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ₹{customer.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total spent</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Export Reports
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: "Sales Report",
              format: "PDF",
              color: "bg-red-100 text-red-600",
            },
            {
              label: "Customer Report",
              format: "Excel",
              color: "bg-green-100 text-green-600",
            },
            {
              label: "Inventory Report",
              format: "PDF",
              color: "bg-blue-100 text-blue-600",
            },
            {
              label: "Financial Summary",
              format: "Excel",
              color: "bg-purple-100 text-purple-600",
            },
          ].map((report, index) => (
            <motion.button
              key={report.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => exportReport(report.format)}
              className={`p-4 rounded-lg ${report.color} text-center hover:shadow-md transition-all duration-200 border border-transparent hover:border-current`}
              aria-label={`Export ${report.label} as ${report.format}`}
            >
              <MdDownload className="mx-auto mb-2 text-2xl" />
              <div className="font-medium">{report.label}</div>
              <div className="text-sm opacity-75">({report.format})</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
