import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MdDashboard,
  MdPeople,
  MdTrendingUp,
  MdAccountBalanceWallet,
  MdAttachMoney,
  MdPersonAdd,
  MdCreditCard,
  MdCurrencyExchange,
  MdSmartphone,
  MdDownload,
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
import { showToast } from "../components/CustomToast";
import DateRangeDropdown from "../components/DateRangeDropdown";
import { pdf } from "@react-pdf/renderer";
import DashboardReportPDF from "../components/DashboardReportPDF";

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
  averageTicket: number;
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
  bankTransferPayments: number;
  goldRate: number;
  silverRate: number;
  newCustomersThisMonth: number;
  newCustomersThisPeriod: number;
  revenueThisMonth: number;
  revenueThisPeriod: number;
  averageInvoiceValue: number;
  uniqueCustomersFromInvoices: number;
  peakDay: string;
  periodLabel: string;
  topMetal: string;
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
  frequency: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface PaymentDistribution {
  name: string;
  value: number;
  color: string;
  count: number;
  amount: number;
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
    bankTransferPayments: 0,
    goldRate: 0,
    silverRate: 0,
    newCustomersThisMonth: 0,
    newCustomersThisPeriod: 0,
    revenueThisMonth: 0,
    revenueThisPeriod: 0,
    averageInvoiceValue: 0,
    uniqueCustomersFromInvoices: 0,
    peakDay: "",
    periodLabel: "",
    topMetal: "",
  });

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [metalDistribution, setMetalDistribution] = useState<
    { name: string; value: number }[]
  >([]);
  const [paymentDistribution, setPaymentDistribution] = useState<
    PaymentDistribution[]
  >([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  }, []);

  // Helper function to get period label
  const getPeriodLabel = useCallback((range: string): string => {
    const now = new Date();
    if (range === "daily") {
      return `Today (${now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })})`;
    } else if (range === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `This Week (${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()})`;
    } else {
      return `This Month (${now.toLocaleDateString("default", {
        month: "long",
        year: "numeric",
      })})`;
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
              name: getPeriodKey(date, range),
            });
          }
        } else if (range === "weekly") {
          for (let i = count - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i * 7);
            periods.push({
              name: getPeriodKey(date, range),
            });
          }
        } else {
          for (let i = count - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            periods.push({
              name: getPeriodKey(date, range),
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
            name: getPeriodKey(date, range),
          });

          currentMonth++;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
        }

        return periods.slice(-count);
      } else if (range === "weekly") {
        const startDate = new Date(minDate);
        const endDate = new Date(maxDate);

        while (startDate <= endDate) {
          periods.push({
            name: getPeriodKey(startDate, range),
          });
          startDate.setDate(startDate.getDate() + 7);
        }

        return periods.slice(-count);
      } else {
        const startDate = new Date(minDate);
        const endDate = new Date(maxDate);

        for (let i = 0; i < count && startDate <= endDate; i++) {
          periods.push({
            name: getPeriodKey(startDate, range),
          });
          startDate.setDate(startDate.getDate() + 1);
        }

        return periods;
      }
    },
    [getPeriodKey]
  );

  // Generate chart data from actual invoices with date filtering
  const generateChartDataFromInvoices = useCallback(
    (
      invoices: Invoice[],
      customers: CustomerFromInvoice[],
      range: string,
      startDate?: Date,
      endDate?: Date
    ): ChartDataItem[] => {
      // Filter invoices by date range if provided
      let filteredInvoices = invoices;
      if (startDate && endDate) {
        filteredInvoices = invoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          return invoiceDate >= startDate && invoiceDate <= endDate;
        });
      }

      if (filteredInvoices.length === 0) return [];

      const periods = getLastPeriods(
        range === "daily" ? 7 : range === "weekly" ? 4 : 6,
        range,
        filteredInvoices
      );
      const groupedData: { [key: string]: ChartDataItem } = {};

      // Initialize periods
      periods.forEach((period) => {
        groupedData[period.name] = {
          name: period.name,
          revenue: 0,
          invoices: 0,
          customers: 0,
          averageTicket: 0,
        };
      });

      // Process invoices
      const customerCountByPeriod: { [key: string]: Set<string> } = {};
      const revenueByPeriod: { [key: string]: number[] } = {};

      periods.forEach((period) => {
        customerCountByPeriod[period.name] = new Set();
        revenueByPeriod[period.name] = [];
      });

      filteredInvoices.forEach((invoice) => {
        const date = new Date(invoice.createdAt);
        const periodKey = getPeriodKey(date, range);

        if (groupedData[periodKey]) {
          const total = invoice.totals?.grandTotal || 0;
          groupedData[periodKey].revenue += total;
          groupedData[periodKey].invoices += 1;
          revenueByPeriod[periodKey].push(total);

          // Track unique customers by phone
          if (invoice.customerSnapshot?.phone) {
            customerCountByPeriod[periodKey].add(
              invoice.customerSnapshot.phone
            );
          }
        }
      });

      // Calculate customers and average ticket
      periods.forEach((period) => {
        const periodData = groupedData[period.name];
        if (periodData) {
          periodData.customers = customerCountByPeriod[period.name]?.size || 0;

          // Calculate average ticket for the period
          const revenues = revenueByPeriod[period.name] || [];
          periodData.averageTicket =
            revenues.length > 0
              ? revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length
              : 0;
        }
      });

      return periods.map((period) => groupedData[period.name]);
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

  // Calculate payment distribution from invoices
  const calculatePaymentDistribution = useCallback(
    (invoices: Invoice[]): PaymentDistribution[] => {
      if (invoices.length === 0) return [];

      const paymentCount: { [key: string]: { count: number; amount: number } } =
        {};
      let totalCount = 0;

      invoices.forEach((invoice) => {
        const paymentMethod = invoice.paymentDetails?.paymentMethod || "cash";
        const amount = invoice.totals?.grandTotal || 0;

        if (!paymentCount[paymentMethod]) {
          paymentCount[paymentMethod] = { count: 0, amount: 0 };
        }
        paymentCount[paymentMethod].count += 1;
        paymentCount[paymentMethod].amount += amount;
        totalCount += 1;
      });

      if (totalCount === 0) return [];

      // Define colors for each payment mode
      const paymentColors: { [key: string]: string } = {
        cash: "#22c55e", // green-500
        card: "#8b5cf6", // violet-500
        upi: "#3b82f6", // blue-500
        bank_transfer: "#06b6d4", // cyan-500
        cheque: "#f59e0b", // amber-500
        other: "#9ca3af", // gray-400
        exchange: "#f97316", // orange-500
        credit: "#ef4444", // red-500
      };

      return Object.entries(paymentCount)
        .map(([name, data]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
          value: Math.round((data.count / totalCount) * 100),
          color: paymentColors[name] || paymentColors.other,
          count: data.count,
          amount: data.amount,
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

      // Add recent invoices (last 8)
      const recentInvoices = invoices
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 8);

      recentInvoices.forEach((invoice) => {
        const paymentMethod = invoice.paymentDetails?.paymentMethod || "cash";
        activities.push({
          id: invoice._id,
          action: `Invoice #${
            invoice.invoiceNumber
          } (${paymentMethod.toUpperCase()})`,
          customer: invoice.customerSnapshot?.name || "Unknown Customer",
          amount: `₹${(invoice.totals?.grandTotal || 0).toLocaleString()}`,
          time: getTimeAgo(new Date(invoice.createdAt)),
          type: "invoice",
        });
      });

      return activities.slice(0, 8);
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
          frequency: customer.totalInvoices, // Using totalInvoices as frequency
        }));
    },
    []
  );

  // Calculate peak day from invoices
  const calculatePeakDay = useCallback((invoices: Invoice[]): string => {
    if (invoices.length === 0) return "N/A";

    const dayCount: { [key: string]: number } = {};

    invoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    let peakDay = "";
    let maxCount = 0;

    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakDay = day;
      }
    });

    return peakDay;
  }, []);

  // Calculate top metal from metal distribution
  const calculateTopMetal = useCallback(
    (metalDistribution: { name: string; value: number }[]): string => {
      if (
        metalDistribution.length === 0 ||
        metalDistribution[0].name === "No Data"
      ) {
        return "N/A";
      }

      // Find the metal with highest percentage
      return metalDistribution.reduce((prev, current) =>
        prev.value > current.value ? prev : current
      ).name;
    },
    []
  );

  // Fetch all dashboard data - FIXED: Remove dependencies that cause infinite loop
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include entire end day

      // Fetch all invoices
      const invoicesRes = await apiClient.get("/invoices");
      const allInvoices: Invoice[] = Array.isArray(invoicesRes.data)
        ? invoicesRes.data
        : invoicesRes.data?.data || [];

      // Filter invoices by date range
      const filteredInvoices = allInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      // Fetch metal rates
      const metalRatesRes = await apiClient.get("/metal-rates/active");
      const rates: Rate[] = Array.isArray(metalRatesRes.data)
        ? metalRatesRes.data
        : metalRatesRes.data?.data || [];

      // Fetch customers from invoices
      const customerMap = new Map<string, CustomerFromInvoice>();

      filteredInvoices.forEach((invoice) => {
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
        customer.totalAmount += invoice.totals?.grandTotal || 0;
        customer.invoices.push(invoice);

        const invoiceDate = new Date(invoice.createdAt);
        const firstPurchase = new Date(customer.firstPurchase);
        const lastPurchase = new Date(customer.lastPurchase);

        if (invoiceDate < firstPurchase) {
          customer.firstPurchase = invoice.createdAt;
        }
        if (invoiceDate > lastPurchase) {
          customer.lastPurchase = invoice.createdAt;
        }
      });

      const customersFromInvoicesData = Array.from(customerMap.values());

      // Get top customers
      const topCustomersData = getTopCustomers(customersFromInvoicesData);
      setTopCustomers(topCustomersData);

      // Calculate stats from filtered data
      const totalRevenue = filteredInvoices.reduce(
        (sum, invoice) => sum + (invoice.totals?.grandTotal || 0),
        0
      );

      // Calculate payment type distributions
      const paymentStats = {
        cashPayments: 0,
        cardPayments: 0,
        upiPayments: 0,
        exchangePayments: 0,
        creditPayments: 0,
        bankTransferPayments: 0,
        otherPayments: 0,
      };

      filteredInvoices.forEach((invoice) => {
        const paymentMethod =
          invoice.paymentDetails?.paymentMethod?.toLowerCase() || "cash";
        switch (paymentMethod) {
          case "cash":
            paymentStats.cashPayments++;
            break;
          case "card":
          case "credit card":
          case "debit card":
            paymentStats.cardPayments++;
            break;
          case "upi":
          case "qr":
            paymentStats.upiPayments++;
            break;
          case "exchange":
          case "metalexchange":
            paymentStats.exchangePayments++;
            break;
          case "credit":
            paymentStats.creditPayments++;
            break;
          case "bank_transfer":
          case "banktransfer":
          case "bank transfer":
            paymentStats.bankTransferPayments++;
            break;
          default:
            paymentStats.otherPayments++;
        }
      });

      // Get new customers in this period
      const newCustomersThisMonth = customersFromInvoicesData.filter(
        (customer) => {
          const customerDate = new Date(customer.firstPurchase);
          return customerDate >= startDate && customerDate <= endDate;
        }
      ).length;

      const revenueThisMonth = totalRevenue;

      const averageInvoiceValue =
        filteredInvoices.length > 0
          ? totalRevenue / filteredInvoices.length
          : 0;

      // Get metal rates
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

      // Calculate peak day
      const peakDay = calculatePeakDay(filteredInvoices);

      // Generate distributions first
      const metalDist = calculateMetalDistribution(filteredInvoices);
      setMetalDistribution(metalDist);

      // Calculate top metal
      const topMetal = calculateTopMetal(metalDist);

      // Generate chart data
      const dynamicChartData = generateChartDataFromInvoices(
        filteredInvoices,
        customersFromInvoicesData,
        timeRange,
        startDate,
        endDate
      );
      setChartData(dynamicChartData);

      // Generate payment distribution
      const paymentDist = calculatePaymentDistribution(filteredInvoices);
      setPaymentDistribution(paymentDist);

      // Generate recent activities
      const activities = generateRecentActivities(
        filteredInvoices,
        customersFromInvoicesData
      );
      setRecentActivities(activities);

      // Update stats - do this last to avoid dependency issues
      setStats({
        totalCustomers: customersFromInvoicesData.length,
        totalInvoices: filteredInvoices.length,
        totalRevenue,
        cashPayments: paymentStats.cashPayments,
        cardPayments: paymentStats.cardPayments,
        upiPayments: paymentStats.upiPayments,
        exchangePayments: paymentStats.exchangePayments,
        creditPayments: paymentStats.creditPayments,
        bankTransferPayments: paymentStats.bankTransferPayments,
        goldRate,
        silverRate,
        newCustomersThisMonth,
        newCustomersThisPeriod: newCustomersThisMonth,
        revenueThisMonth,
        revenueThisPeriod: revenueThisMonth,
        averageInvoiceValue,
        uniqueCustomersFromInvoices: customersFromInvoicesData.length,
        peakDay,
        periodLabel: getPeriodLabel(timeRange),
        topMetal,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      showToast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
    // Only depend on dateRange and timeRange to prevent infinite loops
  }, [dateRange, timeRange]);

  // Load data on initial render and when dateRange or timeRange changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Download PDF report from backend
const downloadPDFReport = async () => {
  try {
    setDownloading(true);

    // Prepare report data
    const reportData = {
      timeRange,
      dateRange,
      chartData,
      stats,
      metalDistribution,
      paymentDistribution,
      topCustomers: topCustomers.slice(0, 10),
      recentActivities: recentActivities.slice(0, 10),
    };

    // Call backend API
    const response = await apiClient.post("/reports/generate-pdf", reportData, {
      responseType: "blob",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle the blob response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    const start = new Date(dateRange.startDate)
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    const end = new Date(dateRange.endDate)
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    link.download = `Dashboard_Report_${start}_to_${end}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    showToast.success("PDF report downloaded successfully!");
  } catch (error: any) {
    console.error("Error downloading PDF:", error);
    
    if (error.response?.status === 404 || error.response?.status === 500) {
      // Fallback to frontend generation if backend fails
      showToast.info("Using frontend PDF generation...");
      await downloadPDFFrontend();
    } else {
      showToast.error("Failed to download PDF report.");
    }
  } finally {
    setDownloading(false);
  }
};

// Frontend fallback function
const downloadPDFFrontend = async () => {
  const reportData = {
    timeRange,
    dateRange,
    stats,
    paymentDistribution,
    topCustomers: topCustomers.slice(0, 5),
  };

  const pdfDoc = <DashboardReportPDF data={reportData} />;
  const blob = await pdf(pdfDoc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const start = new Date(dateRange.startDate)
    .toLocaleDateString("en-IN")
    .replace(/\//g, "-");
  const end = new Date(dateRange.endDate)
    .toLocaleDateString("en-IN")
    .replace(/\//g, "-");
    
  link.download = `Dashboard_Report_${start}_to_${end}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

  // Handle date range change from DateRangeDropdown
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  // Reset to default date range (current month)
  const resetDateRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    setDateRange({
      startDate: firstDay.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
    setTimeRange("monthly");
    setShowDatePicker(false);
    // Use setTimeout to ensure state updates before fetching
    setTimeout(() => {
      fetchDashboardData();
    }, 100);
  };

  // Enhanced Stats Cards with better design
  const statCards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: `₹${stats.totalRevenue.toLocaleString()}`,
        subtitle: getPeriodLabel(timeRange),
        icon: <MdAccountBalanceWallet className="text-3xl" />,
        color: "from-emerald-500 to-teal-600",
        bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
        change: `₹${stats.revenueThisMonth.toLocaleString()} this period`,
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
        change: `${stats.newCustomersThisMonth} new this period`,
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
    ],
    [stats, timeRange, getPeriodLabel]
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

  // Function to get percentage value from change string
  const getPercentageFromChange = (change: string): number => {
    const match = change.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
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
      className="space-y-4 md:space-y-6"
    >
      {/* Header with Date Range Picker - Responsive Design */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-blue-100 sm:p-3 rounded-xl">
            <MdDashboard className="text-xl text-blue-600 sm:text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              Dashboard
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              {getPeriodLabel(timeRange)} - {dateRange.startDate} to{" "}
              {dateRange.endDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2">
          {/* Time Range Buttons - Responsive */}
          <div className="flex gap-1 sm:gap-2">
            {(["daily", "weekly", "monthly"] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  // Fetch data after state update
                  setTimeout(() => fetchDashboardData(), 100);
                }}
                className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-lg transition-colors focus:outline-none focus:ring-0 ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Range Button */}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg sm:gap-2 sm:px-4 sm:py-2 sm:text-sm hover:bg-gray-200 focus:outline-none focus:ring-0"
            aria-label="Select date range"
          >
            <MdCalendarToday className="text-sm sm:text-base" />
            <span className="hidden sm:inline">Date Range</span>
            <span className="sm:hidden">Date</span>
          </button>

          {/* Download Report Button - Responsive */}
          <button
            onClick={downloadPDFReport}
            disabled={downloading}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg sm:gap-2 sm:px-4 sm:py-2 sm:text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
          >
            <MdDownload className="text-sm sm:text-base" />
            <span className="hidden sm:inline">
              {downloading ? "Generating..." : "Download PDF"}
            </span>
            <span className="sm:hidden">{downloading ? "..." : "PDF"}</span>
          </button>
        </div>
      </div>

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg sm:p-4"
        >
          <div className="mb-3 sm:mb-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700 sm:text-base">
              Select Date Range
            </h3>
            <DateRangeDropdown
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
            />
          </div>
          <div className="flex justify-end gap-1 sm:gap-2">
            <button
              onClick={resetDateRange}
              className="px-3 py-1 text-xs font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg sm:px-4 sm:py-2 sm:text-sm hover:bg-gray-300 focus:outline-none focus:ring-0"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setShowDatePicker(false);
                fetchDashboardData();
              }}
              className="px-3 py-1 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg sm:px-4 sm:py-2 sm:text-sm hover:bg-blue-700 focus:outline-none focus:ring-0"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}

      {/* Enhanced Stats Grid - Responsive Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-6">
        {statCards.slice(0, 4).map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative p-4 transition-all duration-300 bg-white border border-gray-200 shadow-sm sm:p-5 md:p-6 rounded-xl md:rounded-2xl hover:shadow-md md:hover:shadow-lg group"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-xl md:rounded-2xl group-hover:opacity-10 transition-opacity`}
            ></div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div
                  className={`p-2 rounded-lg md:rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md sm:p-3`}
                >
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-600 sm:text-sm">
                    {getTrendIcon(stat.trend)}
                    <span
                      className={`hidden xs:inline ${
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
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase sm:text-sm">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 sm:text-sm">
                  {stat.subtitle}
                </p>
              </div>

              {/* Progress Bar for payment cards */}
              {(stat.title === "Cash Payments" ||
                stat.title === "Card Payments" ||
                stat.title === "UPI Payments" ||
                stat.title === "Exchange") && (
                <div className="mt-3 sm:mt-4">
                  <div className="flex justify-between mb-1 text-xs text-gray-500">
                    <span>Percentage</span>
                    <span className="text-xs">{stat.change}</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className={`h-1.5 sm:h-2 transition-all duration-300 ${
                        stat.title === "Cash Payments"
                          ? "bg-green-500"
                          : stat.title === "Card Payments"
                          ? "bg-purple-500"
                          : stat.title === "UPI Payments"
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      } rounded-full`}
                      style={{
                        width: `${getPercentageFromChange(stat.change)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="pt-2 mt-3 border-t border-gray-100 sm:pt-3 sm:mt-4">
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats Cards - Responsive */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 sm:gap-4 lg:gap-6">
        {statCards.slice(4).map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative p-4 transition-all duration-300 bg-white border border-gray-200 shadow-sm sm:p-5 md:p-6 rounded-xl md:rounded-2xl hover:shadow-md md:hover:shadow-lg group"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-xl md:rounded-2xl group-hover:opacity-10 transition-opacity`}
            ></div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div
                  className={`p-2 rounded-lg md:rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md sm:p-3`}
                >
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-600 sm:text-sm">
                    {getTrendIcon(stat.trend)}
                    <span
                      className={`hidden xs:inline ${
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
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase sm:text-sm">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 sm:text-sm">
                  {stat.subtitle}
                </p>
              </div>

              {/* Progress Bar for payment cards */}
              {(stat.title === "Cash Payments" ||
                stat.title === "Card Payments" ||
                stat.title === "UPI Payments" ||
                stat.title === "Exchange") && (
                <div className="mt-3 sm:mt-4">
                  <div className="flex justify-between mb-1 text-xs text-gray-500">
                    <span>Percentage</span>
                    <span className="text-xs">{stat.change}</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className={`h-1.5 sm:h-2 transition-all duration-300 ${
                        stat.title === "Cash Payments"
                          ? "bg-green-500"
                          : stat.title === "Card Payments"
                          ? "bg-purple-500"
                          : stat.title === "UPI Payments"
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      } rounded-full`}
                      style={{
                        width: `${getPercentageFromChange(stat.change)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="pt-2 mt-3 border-t border-gray-100 sm:pt-3 sm:mt-4">
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid - Responsive Containers */}
      {(chartData.length > 0 || stats.totalInvoices > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-4 bg-white border border-gray-200 shadow-sm sm:p-5 md:p-6 rounded-xl md:rounded-2xl"
          >
            <h3 className="mb-3 text-base font-semibold text-gray-800 sm:text-lg">
              Revenue Trend ({timeRange})
            </h3>
            <div className="w-full h-64 sm:h-72 md:h-80">
              {chartData.length > 0 ? (
                <div className="w-full h-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
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
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
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
                <div className="flex items-center justify-center h-full text-sm text-gray-500 sm:text-base">
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
            className="p-4 bg-white border border-gray-200 shadow-sm sm:p-5 md:p-6 rounded-xl md:rounded-2xl"
          >
            <h3 className="mb-3 text-base font-semibold text-gray-800 sm:text-lg">
              Business Metrics ({timeRange})
            </h3>
            <div className="w-full h-64 sm:h-72 md:h-80">
              {chartData.length > 0 ? (
                <div className="w-full h-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
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
                <div className="flex items-center justify-center h-full text-sm text-gray-500 sm:text-base">
                  No business data available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Row - Three Columns with Fixed Height and Scroll - Responsive */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Metal Distribution - Fixed Height with Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="p-4 bg-white border border-gray-200 shadow-sm sm:p-5 md:p-6 rounded-xl md:rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
              Metal Distribution
            </h3>
            {metalDistribution.length > 0 &&
              metalDistribution[0].name !== "No Data" && (
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full sm:px-3 sm:py-1">
                  {metalDistribution.length} metals
                </span>
              )}
          </div>
          <div className="h-56 overflow-hidden sm:h-60 md:h-64">
            {metalDistribution.length > 0 &&
            metalDistribution[0].name !== "No Data" ? (
              <div className="w-full h-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metalDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
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
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "8px",
                        overflowY: "auto",
                        maxHeight: "50px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-500 sm:text-base">
                No metal distribution data
              </div>
            )}
          </div>
          {metalDistribution.length > 0 &&
            metalDistribution[0].name !== "No Data" && (
              <div className="pt-2 mt-2 border-t border-gray-100 sm:pt-3 sm:mt-3">
                <div className="overflow-y-auto max-h-16 sm:max-h-20">
                  <div className="grid grid-cols-2 gap-1 text-xs sm:gap-2">
                    {metalDistribution.map((metal, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-1 bg-gray-50 rounded sm:p-1.5"
                      >
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div
                            className="w-2 h-2 rounded-full sm:w-3 sm:h-3"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="text-xs font-medium text-gray-700 truncate sm:text-sm">
                            {metal.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 sm:text-sm">
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
          className="p-4 bg-white border border-gray-200 shadow-sm sm:p-5 md:p-6 rounded-xl md:rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
              Recent Activities
            </h3>
            {recentActivities.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full sm:px-3 sm:py-1">
                {recentActivities.length} activities
              </span>
            )}
          </div>
          <div className="h-56 pr-1 overflow-y-auto sm:h-60 md:h-64 sm:pr-2">
            {recentActivities.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-center justify-between p-3 transition-all duration-200 rounded-lg bg-gray-50 sm:p-4 md:rounded-xl hover:bg-gray-100 hover:shadow-sm"
                  >
                    <div className="flex items-center min-w-0 gap-2 sm:gap-3 md:gap-4">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 sm:w-3 sm:h-3 ${getActivityIconColor(
                          activity.type
                        )}`}
                      ></div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate sm:text-base">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600 truncate sm:text-sm">
                          {activity.customer}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-1 text-right sm:ml-2">
                      <p className="text-base font-bold text-gray-900 sm:text-lg">
                        {activity.amount}
                      </p>
                      <p className="text-xs text-gray-500 sm:text-sm">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MdPersonAdd className="mx-auto mb-1 text-3xl text-gray-300 sm:mb-2 sm:text-4xl" />
                <p className="text-sm text-center sm:text-base">
                  No recent activities found
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Customers from Invoices - Fixed Height with Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="p-4 bg-white border border-gray-200 shadow-sm sm:p-5 md:p-6 rounded-xl md:rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
              Top Customers
            </h3>
            <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full sm:px-3 sm:py-1">
              {stats.uniqueCustomersFromInvoices} unique
            </span>
          </div>
          <div className="h-56 pr-1 overflow-y-auto sm:h-60 md:h-64 sm:pr-2">
            {topCustomers.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 transition-all duration-200 rounded-lg bg-gray-50 sm:p-4 md:rounded-xl hover:bg-gray-100 hover:shadow-sm"
                  >
                    <div className="flex items-center min-w-0 gap-2 sm:gap-3 md:gap-4">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold text-white rounded-full sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-indigo-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate sm:text-base">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate sm:text-sm">
                          {customer.phone}
                        </p>
                        {customer.email && (
                          <p className="text-xs text-gray-500 truncate">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-1 text-right sm:ml-2">
                      <p className="text-base font-bold text-gray-900 sm:text-lg">
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
                <MdPeople className="mx-auto mb-1 text-3xl text-gray-300 sm:mb-2 sm:text-4xl" />
                <p className="text-sm text-center sm:text-base">
                  No customer data from invoices
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
