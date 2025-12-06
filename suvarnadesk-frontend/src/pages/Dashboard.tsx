import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MdDashboard,
  MdPeople,
  MdTrendingUp,
  MdAccountBalanceWallet,
  MdCalendarToday,
  MdAttachMoney,
  MdPersonAdd,
  MdCreditCard,
  MdCurrencyExchange,
  MdSmartphone,
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

// Define types for data
interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  customerSnapshot: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    huid?: string;
  };
  totals: {
    grandTotal: number;
    subtotal: number;
  };
  paymentDetails: {
    paymentMethod:
      | "cash"
      | "card"
      | "upi"
      | "bank_transfer"
      | "exchange"
      | "credit";
    transactionId?: string;
    paymentDate?: string;
    exchangeDetails?: {
      oldGoldWeight?: number;
      oldGoldRate?: number;
      exchangeValue?: number;
    };
  };
  createdAt: string;
  lineItems: Array<{
    metalType?: string;
    itemType: string;
  }>;
}

interface CustomerFromInvoice {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  huid?: string;
  totalInvoices: number;
  totalAmount: number;
  firstPurchase: string;
  lastPurchase: string;
  invoices: Invoice[];
}

interface Rate {
  _id: string;
  metalType: "gold" | "silver";
  ratePerGram: number;
  purity: string;
  isActive: boolean;
}

interface ChartDataItem {
  name: string;
  revenue: number;
  invoices: number;
  customers: number;
}

interface Stats {
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: number;
  cashPayments: number;
  cardPayments: number;
  upiPayments: number;
  exchangePayments: number;
  creditPayments: number;
  goldRate: number;
  silverRate: number;
  newCustomersThisMonth: number;
  revenueThisMonth: number;
  averageInvoiceValue: number;
  uniqueCustomersFromInvoices: number;
}

interface RecentActivity {
  id: string;
  action: string;
  customer: string;
  amount: string;
  time: string;
  type: "invoice" | "payment" | "new_customer";
}

interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalInvoices: number;
  totalSpent: number;
  lastPurchase: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    cashPayments: 0,
    cardPayments: 0,
    upiPayments: 0,
    exchangePayments: 0,
    creditPayments: 0,
    goldRate: 0,
    silverRate: 0,
    newCustomersThisMonth: 0,
    revenueThisMonth: 0,
    averageInvoiceValue: 0,
    uniqueCustomersFromInvoices: 0,
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [timeRange, setTimeRange] = useState("monthly");
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [metalDistribution, setMetalDistribution] = useState<
    { name: string; value: number }[]
  >([]);
  const [customersFromInvoices, setCustomersFromInvoices] = useState<
    CustomerFromInvoice[]
  >([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  // Helper function to get time ago string
  const getTimeAgo = useCallback((date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }, []);

  // Helper function to get period key
  const getPeriodKey = useCallback((date: Date, range: string): string => {
    if (range === "monthly") {
      return date.toLocaleString("default", { month: "short" });
    } else if (range === "weekly") {
      const weekNumber = Math.ceil(date.getDate() / 7);
      return `Week ${weekNumber}`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Helper function to get last N periods based on actual data
  const getLastPeriods = useCallback(
    (count: number, range: string, invoices: Invoice[]): { name: string }[] => {
      const periods: { name: string }[] = [];

      if (invoices.length === 0) {
        const now = new Date();
        if (range === "monthly") {
          for (let i = count - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            periods.push({
              name: date.toLocaleString("default", { month: "short" }),
            });
          }
        }
        return periods;
      }

      const invoiceDates = invoices.map((inv) => new Date(inv.createdAt));
      const minDate = new Date(
        Math.min(...invoiceDates.map((d) => d.getTime()))
      );
      const maxDate = new Date(
        Math.max(...invoiceDates.map((d) => d.getTime()))
      );

      if (range === "monthly") {
        const startMonth = minDate.getMonth();
        const startYear = minDate.getFullYear();
        const endMonth = maxDate.getMonth();
        const endYear = maxDate.getFullYear();

        let currentMonth = startMonth;
        let currentYear = startYear;

        while (
          currentYear < endYear ||
          (currentYear === endYear && currentMonth <= endMonth)
        ) {
          const date = new Date(currentYear, currentMonth, 1);
          periods.push({
            name: date.toLocaleString("default", { month: "short" }),
          });

          currentMonth++;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
        }

        return periods.slice(-count);
      }

      const now = new Date();
      for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periods.push({
          name: date.toLocaleString("default", { month: "short" }),
        });
      }

      return periods;
    },
    []
  );

  // Generate chart data from actual invoices
  const generateChartDataFromInvoices = useCallback(
    (
      invoices: Invoice[],
      customers: CustomerFromInvoice[],
      range: string
    ): ChartDataItem[] => {
      if (invoices.length === 0) return [];

      const groupedData: { [key: string]: ChartDataItem } = {};

      const periods = getLastPeriods(6, range, invoices);
      periods.forEach((period) => {
        groupedData[period.name] = {
          name: period.name,
          revenue: 0,
          invoices: 0,
          customers: 0,
        };
      });

      // Process invoices
      invoices.forEach((invoice) => {
        const date = new Date(invoice.createdAt);
        const periodKey = getPeriodKey(date, range);

        if (groupedData[periodKey]) {
          groupedData[periodKey].revenue += invoice.totals?.grandTotal || 0;
          groupedData[periodKey].invoices += 1;
        }
      });

      // Process customers for each period (from invoices)
      periods.forEach((period) => {
        const periodCustomers = customers.filter((customer) => {
          const customerFirstDate = new Date(customer.firstPurchase);
          return getPeriodKey(customerFirstDate, range) === period.name;
        });
        groupedData[period.name].customers = periodCustomers.length;
      });

      return periods
        .map((period) => groupedData[period.name])
        .filter(
          (item) => item.revenue > 0 || item.invoices > 0 || item.customers > 0
        );
    },
    [getLastPeriods, getPeriodKey]
  );

  // Calculate metal distribution from invoices
  const calculateMetalDistribution = useCallback(
    (invoices: Invoice[]): { name: string; value: number }[] => {
      if (invoices.length === 0) return [{ name: "No Data", value: 100 }];

      const metalCount: { [key: string]: number } = {};
      let total = 0;

      invoices.forEach((invoice) => {
        invoice.lineItems.forEach((item) => {
          const metalType = item.metalType || item.itemType || "Other";
          metalCount[metalType] = (metalCount[metalType] || 0) + 1;
          total++;
        });
      });

      if (total === 0) {
        return [{ name: "No Data", value: 100 }];
      }

      return Object.entries(metalCount)
        .map(([name, count]) => ({
          name,
          value: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.value - a.value);
    },
    []
  );

  // Generate recent activities from invoices
  const generateRecentActivities = useCallback(
    (
      invoices: Invoice[],
      customers: CustomerFromInvoice[]
    ): RecentActivity[] => {
      const activities: RecentActivity[] = [];

      // Add recent invoices (last 5)
      const recentInvoices = invoices
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      recentInvoices.forEach((invoice) => {
        activities.push({
          id: invoice._id,
          action: `New Invoice (${
            invoice.paymentDetails?.paymentMethod?.toUpperCase() || "CASH"
          })`,
          customer: invoice.customerSnapshot?.name || "Unknown Customer",
          amount: `₹${(invoice.totals?.grandTotal || 0).toLocaleString()}`,
          time: getTimeAgo(new Date(invoice.createdAt)),
          type: "invoice",
        });
      });

      // Add recent customers (last 3) - from invoices
      const recentCustomers = customers
        .sort(
          (a, b) =>
            new Date(b.firstPurchase).getTime() -
            new Date(a.firstPurchase).getTime()
        )
        .slice(0, 3);

      recentCustomers.forEach((customer) => {
        activities.push({
          id: customer._id,
          action: "New Customer",
          customer: customer.name,
          amount: `₹${customer.totalAmount.toLocaleString()}`,
          time: getTimeAgo(new Date(customer.firstPurchase)),
          type: "new_customer",
        });
      });

      // Sort all activities by time and take top 8
      return activities
        .sort((a, b) => {
          const timeA = a.time.includes("min")
            ? parseInt(a.time)
            : a.time.includes("hour")
            ? parseInt(a.time) * 60
            : parseInt(a.time) * 1440;
          const timeB = b.time.includes("min")
            ? parseInt(b.time)
            : b.time.includes("hour")
            ? parseInt(b.time) * 60
            : parseInt(b.time) * 1440;
          return timeB - timeA;
        })
        .slice(0, 8);
    },
    [getTimeAgo]
  );

  // Get top customers from invoices
  const getTopCustomers = useCallback(
    (customers: CustomerFromInvoice[]): TopCustomer[] => {
      return customers
        .sort((a, b) => b.totalAmount - a.totalAmount) // Sort by total spent
        .slice(0, 10) // Get top 10
        .map((customer) => ({
          id: customer._id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          totalInvoices: customer.totalInvoices,
          totalSpent: customer.totalAmount,
          lastPurchase: customer.lastPurchase,
        }));
    },
    []
  );

  // Fetch customers and their invoices
  const fetchCustomersFromInvoices = useCallback(
    async (invoices: Invoice[]): Promise<CustomerFromInvoice[]> => {
      try {
        // Group invoices by customer
        const customerMap = new Map<string, CustomerFromInvoice>();

        invoices.forEach((invoice) => {
          const customerData = invoice.customerSnapshot;
          const customerKey =
            `${customerData.phone}-${customerData.email}`.toLowerCase();

          if (!customerMap.has(customerKey)) {
            customerMap.set(customerKey, {
              _id: customerKey,
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              address: customerData.address,
              huid: customerData.huid,
              totalInvoices: 0,
              totalAmount: 0,
              firstPurchase: invoice.createdAt,
              lastPurchase: invoice.createdAt,
              invoices: [],
            });
          }

          const customer = customerMap.get(customerKey)!;
          customer.totalInvoices += 1;
          customer.totalAmount += invoice.totals.grandTotal;
          customer.invoices.push(invoice);

          if (new Date(invoice.createdAt) < new Date(customer.firstPurchase)) {
            customer.firstPurchase = invoice.createdAt;
          }
          if (new Date(invoice.createdAt) > new Date(customer.lastPurchase)) {
            customer.lastPurchase = invoice.createdAt;
          }
        });

        return Array.from(customerMap.values());
      } catch (error) {
        console.error("Error fetching customers from invoices:", error);
        return [];
      }
    },
    []
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data
        const [invoicesRes, metalRatesRes] = await Promise.all([
          apiClient.get("/invoices"),
          apiClient.get("/metal-rates/active"),
        ]);

        // Handle different response formats
        const invoices: Invoice[] = Array.isArray(invoicesRes.data)
          ? invoicesRes.data
          : invoicesRes.data?.data || [];

        const rates: Rate[] = Array.isArray(metalRatesRes.data)
          ? metalRatesRes.data
          : metalRatesRes.data?.data || [];

        // Fetch customers from invoices
        const customersFromInvoicesData = await fetchCustomersFromInvoices(
          invoices
        );
        setCustomersFromInvoices(customersFromInvoicesData);

        // Get top customers
        const topCustomersData = getTopCustomers(customersFromInvoicesData);
        setTopCustomers(topCustomersData);

        // Calculate stats from real data
        const totalRevenue = invoices.reduce(
          (sum: number, invoice: Invoice) =>
            sum + (invoice.totals?.grandTotal || 0),
          0
        );

        // Calculate payment type distributions
        let cashPayments = 0;
        let cardPayments = 0;
        let upiPayments = 0;
        let exchangePayments = 0;
        let creditPayments = 0;

        invoices.forEach((invoice: Invoice) => {
          const paymentMethod = invoice.paymentDetails?.paymentMethod || "cash";
          switch (paymentMethod) {
            case "cash":
              cashPayments++;
              break;
            case "card":
              cardPayments++;
              break;
            case "upi":
              upiPayments++;
              break;
            case "exchange":
              exchangePayments++;
              break;
            case "credit":
              creditPayments++;
              break;
            default:
              cashPayments++;
          }
        });

        // Get current month for calculations
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Get new customers this month from invoices
        const newCustomersThisMonth = customersFromInvoicesData.filter(
          (customer) => {
            const customerDate = new Date(customer.firstPurchase);
            return (
              customerDate.getMonth() === currentMonth &&
              customerDate.getFullYear() === currentYear
            );
          }
        ).length;

        const revenueThisMonth = invoices
          .filter((invoice) => {
            const invoiceDate = new Date(invoice.createdAt);
            return (
              invoiceDate.getMonth() === currentMonth &&
              invoiceDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, invoice) => sum + (invoice.totals?.grandTotal || 0), 0);

        const averageInvoiceValue =
          invoices.length > 0 ? totalRevenue / invoices.length : 0;

        // Get current gold and silver rates
        const goldRates = rates.filter(
          (rate) => rate.metalType === "gold" && rate.isActive
        );
        const silverRates = rates.filter(
          (rate) => rate.metalType === "silver" && rate.isActive
        );

        const goldRate =
          goldRates.length > 0
            ? Math.max(...goldRates.map((r) => r.ratePerGram))
            : 0;
        const silverRate =
          silverRates.length > 0
            ? Math.max(...silverRates.map((r) => r.ratePerGram))
            : 0;

        setStats({
          totalCustomers: customersFromInvoicesData.length, // This is now from invoices
          totalInvoices: invoices.length,
          totalRevenue,
          cashPayments,
          cardPayments,
          upiPayments,
          exchangePayments,
          creditPayments,
          goldRate,
          silverRate,
          newCustomersThisMonth,
          revenueThisMonth,
          averageInvoiceValue,
          uniqueCustomersFromInvoices: customersFromInvoicesData.length,
        });

        // Generate chart data from real invoices
        const dynamicChartData = generateChartDataFromInvoices(
          invoices,
          customersFromInvoicesData,
          timeRange
        );
        setChartData(dynamicChartData);

        // Generate metal distribution from invoices
        const metalDist = calculateMetalDistribution(invoices);
        setMetalDistribution(metalDist);

        // Generate recent activities from invoices
        const activities = generateRecentActivities(
          invoices,
          customersFromInvoicesData
        );
        setRecentActivities(activities);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setChartData([]);
        setRecentActivities([]);
        setMetalDistribution([]);
        setCustomersFromInvoices([]);
        setTopCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    timeRange,
    generateChartDataFromInvoices,
    calculateMetalDistribution,
    generateRecentActivities,
    fetchCustomersFromInvoices,
    getTopCustomers,
  ]);

  // Enhanced Stats Cards with better design
  const statCards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: `₹${stats.totalRevenue.toLocaleString()}`,
        subtitle: "Lifetime Earnings",
        icon: <MdAccountBalanceWallet className="text-3xl" />,
        color: "from-emerald-500 to-teal-600",
        bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
        change: `₹${stats.revenueThisMonth.toLocaleString()} this month`,
        trend: "up",
        description: "Total revenue from all invoices",
      },
      {
        title: "Total Customers",
        value: stats.totalCustomers.toLocaleString(),
        subtitle: "From Invoices",
        icon: <MdPeople className="text-3xl" />,
        color: "from-blue-500 to-indigo-600",
        bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
        change: `${stats.newCustomersThisMonth} new this month`,
        trend: "up",
        description: "Unique customers from invoices",
      },
      {
        title: "Cash Payments",
        value: stats.cashPayments.toLocaleString(),
        subtitle: "Cash Transactions",
        icon: <MdAttachMoney className="text-3xl" />,
        color: "from-green-500 to-emerald-600",
        bgColor: "bg-gradient-to-br from-green-50 to-emerald-100",
        change: `${
          Math.round((stats.cashPayments / stats.totalInvoices) * 100) || 0
        }% of total`,
        trend: "up",
        description: "Number of cash payments",
      },
      {
        title: "Card Payments",
        value: stats.cardPayments.toLocaleString(),
        subtitle: "Credit/Debit Cards",
        icon: <MdCreditCard className="text-3xl" />,
        color: "from-purple-500 to-violet-600",
        bgColor: "bg-gradient-to-br from-purple-50 to-violet-100",
        change: `${
          Math.round((stats.cardPayments / stats.totalInvoices) * 100) || 0
        }% of total`,
        trend: "up",
        description: "Number of card payments",
      },
      {
        title: "UPI Payments",
        value: stats.upiPayments.toLocaleString(),
        subtitle: "Digital Payments",
        icon: <MdSmartphone className="text-3xl" />,
        color: "from-indigo-500 to-blue-600",
        bgColor: "bg-gradient-to-br from-indigo-50 to-blue-100",
        change: `${
          Math.round((stats.upiPayments / stats.totalInvoices) * 100) || 0
        }% of total`,
        trend: "up",
        description: "Number of UPI payments",
      },
      {
        title: "Exchange",
        value: stats.exchangePayments.toLocaleString(),
        subtitle: "Exchange Transactions",
        icon: <MdCurrencyExchange className="text-3xl" />,
        color: "from-orange-500 to-red-600",
        bgColor: "bg-gradient-to-br from-orange-50 to-red-100",
        change: `${
          Math.round((stats.exchangePayments / stats.totalInvoices) * 100) || 0
        }% of total`,
        trend: "neutral",
        description: "Number of exchange transactions",
      },
      {
        title: "Gold Rate",
        value: stats.goldRate > 0 ? `₹${stats.goldRate}/g` : "N/A",
        subtitle: "Current Market",
        icon: <MdTrendingUp className="text-3xl" />,
        color: "from-yellow-500 to-amber-600",
        bgColor: "bg-gradient-to-br from-yellow-50 to-amber-100",
        change: "Live gold price",
        trend: "neutral",
        description: "Current gold rate per gram",
      },
      {
        title: "Silver Rate",
        value: stats.silverRate > 0 ? `₹${stats.silverRate}/g` : "N/A",
        subtitle: "Current Market",
        icon: <MdCalendarToday className="text-3xl" />,
        color: "from-gray-500 to-slate-600",
        bgColor: "bg-gradient-to-br from-gray-50 to-slate-100",
        change: "Live silver price",
        trend: "neutral",
        description: "Current silver rate per gram",
      },
    ],
    [stats]
  );

  const COLORS = [
    "#FFD700",
    "#C0C0C0",
    "#E5E4E2",
    "#8884D8",
    "#FF8042",
    "#00C49F",
  ];

  // Safe label formatter for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
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

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-green-500";
      case "invoice":
        return "bg-blue-500";
      case "new_customer":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <MdTrendingUp className="text-green-600" />;
      case "down":
        return <MdTrendingUp className="text-red-600 transform rotate-180" />;
      default:
        return <MdTrendingUp className="text-gray-400" />;
    }
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
              Real-time jewelry shop management overview
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {["monthly", "weekly"].map((range) => (
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

      {/* Enhanced Stats Grid - Bigger Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-lg group"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity`}
            ></div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}
                >
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                    {getTrendIcon(stat.trend)}
                    <span
                      className={`${
                        stat.trend === "up"
                          ? "text-green-600"
                          : stat.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>

              {/* Progress Bar for payment cards */}
              {(stat.title === "Cash Payments" ||
                stat.title === "Card Payments" ||
                stat.title === "UPI Payments" ||
                stat.title === "Exchange") && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1 text-xs text-gray-500">
                    <span>Percentage</span>
                    <span>{stat.change}</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className={`h-2 transition-all duration-300 ${
                        stat.title === "Cash Payments"
                          ? "bg-green-500"
                          : stat.title === "Card Payments"
                          ? "bg-purple-500"
                          : stat.title === "UPI Payments"
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      }`}
                      style={{
                        // Use inline style for dynamic width
                        width: stat.change.split("%")[0] + "%",
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="pt-3 mt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid - FIXED CONTAINERS WITH EXPLICIT DIMENSIONS */}
      {(chartData.length > 0 || stats.totalInvoices > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Revenue Trend ({timeRange})
            </h3>
            <div className="w-full h-80">
              {chartData.length > 0 ? (
                <div className="w-full h-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        formatter={(value: number) => [
                          `₹${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0088FE"
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0088FE"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0088FE"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No revenue data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Business Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Business Metrics ({timeRange})
            </h3>
            <div className="w-full h-80">
              {chartData.length > 0 ? (
                <div className="w-full h-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="invoices"
                        fill="#00C49F"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="customers"
                        fill="#8884D8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No business data available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Row - Three Columns with Fixed Height and Scroll */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Metal Distribution - Fixed Height with Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Metal Distribution
            </h3>
            {metalDistribution.length > 0 &&
              metalDistribution[0].name !== "No Data" && (
                <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  {metalDistribution.length} metals
                </span>
              )}
          </div>
          <div className="h-64 overflow-hidden">
            {metalDistribution.length > 0 &&
            metalDistribution[0].name !== "No Data" ? (
              <div className="w-full h-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metalDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {metalDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Percentage"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "10px",
                        overflowY: "auto",
                        maxHeight: "60px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No metal distribution data
              </div>
            )}
          </div>
          {metalDistribution.length > 0 &&
            metalDistribution[0].name !== "No Data" && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="overflow-y-auto max-h-20">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {metalDistribution.map((metal, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-1.5 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-medium text-gray-700 truncate">
                            {metal.name}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {metal.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </motion.div>

        {/* Recent Activities - Fixed Height with Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Activities
            </h3>
            {recentActivities.length > 0 && (
              <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                {recentActivities.length} activities
              </span>
            )}
          </div>
          <div className="h-64 pr-2 overflow-y-auto">
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-center justify-between p-4 transition-all duration-200 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-sm"
                  >
                    <div className="flex items-center min-w-0 gap-4">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${getActivityIconColor(
                          activity.type
                        )}`}
                      ></div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.customer}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2 text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {activity.amount}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MdPersonAdd className="mx-auto mb-2 text-4xl text-gray-300" />
                <p>No recent activities found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Customers from Invoices - Fixed Height with Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Top Customers
            </h3>
            <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
              {stats.uniqueCustomersFromInvoices} unique
            </span>
          </div>
          <div className="h-64 pr-2 overflow-y-auto">
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 transition-all duration-200 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-sm"
                  >
                    <div className="flex items-center min-w-0 gap-4">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {customer.phone}
                        </p>
                        {customer.email && (
                          <p className="text-xs text-gray-500 truncate">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2 text-right">
                      <p className="font-bold text-gray-900">
                        ₹{customer.totalSpent.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.totalInvoices} invoice
                        {customer.totalInvoices > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MdPeople className="mx-auto mb-2 text-4xl text-gray-300" />
                <p>No customer data from invoices</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
