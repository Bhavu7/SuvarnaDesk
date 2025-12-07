// components/DashboardReportPDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Link,
} from "@react-pdf/renderer";

// Register fonts (you'll need to add these font files to your public folder)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "/fonts/Helvetica.ttf" },
    { src: "/fonts/Helvetica-Bold.ttf", fontWeight: "bold" },
  ],
});

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
    { src: "/fonts/Roboto-Medium.ttf", fontWeight: "medium" },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #3b82f6",
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 3,
  },
  headerDate: {
    fontSize: 11,
    color: "#4b5563",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: "1 solid #e5e7eb",
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    marginTop: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    border: "1 solid #e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "medium",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 9,
    color: "#9ca3af",
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderCell: {
    flex: 1,
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableRowEven: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: "#374151",
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
  },
  tableCellSuccess: {
    color: "#059669",
    fontWeight: "bold",
  },
  pill: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 8,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  distributionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  distributionColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 8,
  },
  distributionText: {
    flex: 1,
    fontSize: 9,
    color: "#374151",
  },
  distributionValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
  logoContainer: {
    position: "absolute",
    top: 40,
    right: 40,
    width: 80,
    height: 40,
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1 solid #f3f4f6",
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  activityCustomer: {
    fontSize: 8,
    color: "#6b7280",
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
  },
  activityTime: {
    fontSize: 8,
    color: "#9ca3af",
  },
  chartLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  chartBar: {
    height: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 3,
    marginBottom: 15,
  },
  chartContainer: {
    marginTop: 10,
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 80,
    color: "rgba(59, 130, 246, 0.05)",
    fontWeight: "bold",
  },
});

interface DashboardReportPDFProps {
  data: {
    timeRange: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    chartData: Array<{
      name: string;
      revenue: number;
      invoices: number;
      customers: number;
      averageTicket: number;
    }>;
    stats: {
      totalCustomers: number;
      totalInvoices: number;
      totalRevenue: number;
      cashPayments: number;
      cardPayments: number;
      upiPayments: number;
      exchangePayments: number;
      creditPayments: number;
      bankTransferPayments: number;
      newCustomersThisPeriod: number;
      revenueThisPeriod: number;
      averageInvoiceValue: number;
      periodLabel: string;
      topMetal: string;
      peakDay: string;
    };
    metalDistribution: Array<{
      name: string;
      value: number;
    }>;
    paymentDistribution: Array<{
      name: string;
      value: number;
      color: string;
      count: number;
      amount: number;
    }>;
    topCustomers: Array<{
      id: string;
      name: string;
      phone: string;
      email?: string;
      totalInvoices: number;
      totalSpent: number;
      lastPurchase: string;
      frequency: number;
    }>;
    recentActivities: Array<{
      id: string;
      action: string;
      customer: string;
      amount: string;
      time: string;
      type: string;
    }>;
  };
}

const DashboardReportPDF: React.FC<DashboardReportPDFProps> = ({ data }) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate total pages
  const getTotalPages = () => {
    // You can make this dynamic based on content length
    return 3;
  };

  // Color mapping for payment methods
  const getPaymentColor = (paymentName: string) => {
    const colors: { [key: string]: string } = {
      Cash: "#22c55e",
      Card: "#8b5cf6",
      Upi: "#3b82f6",
      "Bank Transfer": "#06b6d4",
      Cheque: "#f59e0b",
      Exchange: "#f97316",
      Credit: "#ef4444",
      Other: "#9ca3af",
    };
    return colors[paymentName] || "#9ca3af";
  };

  // Render page number
  const renderPageNumber = ({
    pageNumber,
    totalPages,
  }: {
    pageNumber: number;
    totalPages: number;
  }) => (
    <Text style={styles.pageNumber}>
      Page {pageNumber} of {totalPages}
    </Text>
  );

  // Page 1: Overview & Key Metrics
  const renderPage1 = () => (
    <Page size="A4" style={styles.page}>
      {/* Watermark */}
      <Text style={styles.watermark}>SuvarnaDesk</Text>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image src="/logo.png" style={styles.logo} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Analytics Report</Text>
        <Text style={styles.headerSubtitle}>
          Jewelry Shop Performance Analysis
        </Text>
        <Text style={styles.headerDate}>
          Report Period: {formatDate(data.dateRange.startDate)} -{" "}
          {formatDate(data.dateRange.endDate)}
        </Text>
        <Text style={styles.headerDate}>
          Time Range:{" "}
          {data.timeRange.charAt(0).toUpperCase() + data.timeRange.slice(1)} |
          Generated on:{" "}
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text
          style={{
            fontSize: 10,
            lineHeight: 1.5,
            color: "#4b5563",
            marginBottom: 15,
          }}
        >
          This report provides a comprehensive overview of the jewelry shop's
          performance during the specified period. Key highlights include
          revenue generation, customer acquisition, payment trends, and
          inventory insights.
        </Text>
      </View>

      {/* Key Performance Indicators */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.grid}>
          {/* Revenue Metrics */}
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Revenue</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(data.stats.totalRevenue)}
            </Text>
            <Text style={styles.metricSubtitle}>
              {formatCurrency(data.stats.revenueThisPeriod)} this period
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Customers</Text>
            <Text style={styles.metricValue}>{data.stats.totalCustomers}</Text>
            <Text style={styles.metricSubtitle}>
              {data.stats.newCustomersThisPeriod} new this period
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Invoices</Text>
            <Text style={styles.metricValue}>{data.stats.totalInvoices}</Text>
            <Text style={styles.metricSubtitle}>
              Avg: {formatCurrency(data.stats.averageInvoiceValue)} per invoice
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Peak Performance</Text>
            <Text style={[styles.metricValue, { fontSize: 16 }]}>
              {data.stats.peakDay}
            </Text>
            <Text style={styles.metricSubtitle}>
              Highest revenue day | Top metal: {data.stats.topMetal}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Method Distribution */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Payment Method Distribution</Text>
        {data.paymentDistribution.length > 0 ? (
          <>
            <View style={{ marginBottom: 15 }}>
              {data.paymentDistribution.map((payment, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: "#374151" }}>
                      {payment.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {payment.value}% ({payment.count} transactions)
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${payment.value}%`,
                          backgroundColor: getPaymentColor(payment.name),
                        },
                      ]}
                    />
                  </View>
                  <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>
                    Total: {formatCurrency(payment.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={{ fontSize: 9, color: "#6b7280", fontStyle: "italic" }}>
            No payment distribution data available
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>SuvarnaDesk - Jewelry Shop Management System</Text>
        <Text>Confidential Report - For Internal Use Only</Text>
      </View>
      {renderPageNumber({ pageNumber: 1, totalPages: getTotalPages() })}
    </Page>
  );

  // Page 2: Customer Insights & Activities
  const renderPage2 = () => (
    <Page size="A4" style={styles.page}>
      <Text style={styles.watermark}>Customer Insights</Text>

      {/* Top Customers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Customers Analysis</Text>
        {data.topCustomers.length > 0 ? (
          <>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
                  Customer
                </Text>
                <Text style={styles.tableHeaderCell}>Phone</Text>
                <Text style={styles.tableHeaderCell}>Invoices</Text>
                <Text style={styles.tableHeaderCell}>Total Spent</Text>
                <Text style={styles.tableHeaderCell}>Frequency*</Text>
              </View>
              {data.topCustomers.map((customer, index) => (
                <View
                  key={customer.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : {},
                  ]}
                >
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {customer.name}
                  </Text>
                  <Text style={styles.tableCell}>{customer.phone}</Text>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>
                    {customer.totalInvoices}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellSuccess]}>
                    {formatCurrency(customer.totalSpent)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {customer.frequency}/month
                  </Text>
                </View>
              ))}
            </View>
            <Text
              style={{ fontSize: 8, color: "#6b7280", fontStyle: "italic" }}
            >
              *Frequency: Average purchases per month
            </Text>
          </>
        ) : (
          <Text style={{ fontSize: 9, color: "#6b7280", fontStyle: "italic" }}>
            No customer data available
          </Text>
        )}
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {data.recentActivities.length > 0 ? (
          <View>
            {data.recentActivities.map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityDot,
                    {
                      backgroundColor:
                        activity.type === "invoice"
                          ? "#3b82f6"
                          : activity.type === "payment"
                          ? "#10b981"
                          : "#8b5cf6",
                    },
                  ]}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityCustomer}>
                    {activity.customer}
                  </Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityAmount}>{activity.amount}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 9, color: "#6b7280", fontStyle: "italic" }}>
            No recent activities
          </Text>
        )}
      </View>

      {/* Metal Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metal Distribution by Revenue</Text>
        {data.metalDistribution.length > 0 &&
        data.metalDistribution[0].name !== "No Data" ? (
          <View>
            {data.metalDistribution.map((metal, index) => {
              const colors = [
                "#FFD700",
                "#C0C0C0",
                "#E5E4E2",
                "#CD7F32",
                "#B9F2FF",
              ];
              return (
                <View key={index} style={styles.distributionItem}>
                  <View
                    style={[
                      styles.distributionColor,
                      { backgroundColor: colors[index % colors.length] },
                    ]}
                  />
                  <Text style={styles.distributionText}>{metal.name}</Text>
                  <Text style={styles.distributionValue}>{metal.value}%</Text>
                </View>
              );
            })}

            {/* Visual representation */}
            <View style={{ marginTop: 15 }}>
              {data.metalDistribution.slice(0, 3).map((metal, index) => {
                const colors = ["#FFD700", "#C0C0C0", "#E5E4E2"];
                return (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <Text style={styles.chartLabel}>
                      {metal.name} - {metal.value}%
                    </Text>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          width: `${metal.value * 2}%`,
                          backgroundColor: colors[index % colors.length],
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: 9, color: "#6b7280", fontStyle: "italic" }}>
            No metal distribution data available
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text>Page 2 - Customer Insights & Activities</Text>
      </View>
      {renderPageNumber({ pageNumber: 2, totalPages: getTotalPages() })}
    </Page>
  );

  // Page 3: Performance Trends & Charts
  const renderPage3 = () => (
    <Page size="A4" style={styles.page}>
      <Text style={styles.watermark}>Performance Trends</Text>

      {/* Performance Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {data.timeRange.charAt(0).toUpperCase() + data.timeRange.slice(1)}{" "}
          Performance Summary
        </Text>
        {data.chartData.length > 0 ? (
          <>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Period</Text>
                <Text style={styles.tableHeaderCell}>Revenue</Text>
                <Text style={styles.tableHeaderCell}>Invoices</Text>
                <Text style={styles.tableHeaderCell}>Customers</Text>
                <Text style={styles.tableHeaderCell}>Avg Ticket</Text>
              </View>
              {data.chartData.map((period, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.tableCellBold]}>
                    {period.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellSuccess]}>
                    {formatCurrency(period.revenue)}
                  </Text>
                  <Text style={styles.tableCell}>{period.invoices}</Text>
                  <Text style={styles.tableCell}>{period.customers}</Text>
                  <Text style={[styles.tableCell, { color: "#f59e0b" }]}>
                    {formatCurrency(period.averageTicket)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={{ fontSize: 9, color: "#6b7280", fontStyle: "italic" }}>
            No chart data available
          </Text>
        )}
      </View>

      {/* Detailed Payment Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Payment Breakdown</Text>
        <View style={styles.grid}>
          {data.paymentDistribution.map((payment, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricTitle}>{payment.name}</Text>
              <Text style={[styles.metricValue, { fontSize: 16 }]}>
                {payment.value}%
              </Text>
              <Text style={styles.metricSubtitle}>
                {payment.count} transactions
              </Text>
              <Text
                style={[
                  styles.metricSubtitle,
                  { color: "#059669", fontWeight: "bold" },
                ]}
              >
                {formatCurrency(payment.amount)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Performance Highlights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Highlights</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <View style={{ width: "48%", marginBottom: 10 }}>
            <Text style={styles.subsectionTitle}>Top Day</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 5,
              }}
            >
              {data.stats.peakDay}
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280" }}>
              Highest revenue generating day
            </Text>
          </View>

          <View style={{ width: "48%", marginBottom: 10 }}>
            <Text style={styles.subsectionTitle}>Most Popular Metal</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 5,
              }}
            >
              {data.stats.topMetal}
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280" }}>
              Highest revenue contribution
            </Text>
          </View>

          <View style={{ width: "48%", marginBottom: 10 }}>
            <Text style={styles.subsectionTitle}>Customer Growth</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 5,
              }}
            >
              +{data.stats.newCustomersThisPeriod}
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280" }}>
              New customers acquired
            </Text>
          </View>

          <View style={{ width: "48%", marginBottom: 10 }}>
            <Text style={styles.subsectionTitle}>Average Ticket</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 5,
              }}
            >
              {formatCurrency(data.stats.averageInvoiceValue)}
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280" }}>
              Per transaction average
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendations & Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations & Insights</Text>
        <View
          style={{
            padding: 10,
            backgroundColor: "#f0f9ff",
            borderRadius: 6,
            border: "1 solid #dbeafe",
          }}
        >
          <Text
            style={{
              fontSize: 9,
              color: "#1e40af",
              marginBottom: 5,
              fontWeight: "bold",
            }}
          >
            Key Insights:
          </Text>
          <Text style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>
            1. {data.stats.topMetal} contributes significantly to revenue.
            Consider expanding {data.stats.topMetal.toLowerCase()} collection.
            {"\n"}2. Peak revenue on {data.stats.peakDay}s suggests optimal
            staffing and inventory levels needed.
            {"\n"}3. {data.paymentDistribution[0]?.name || "Cash"} is the most
            popular payment method ({data.paymentDistribution[0]?.value || 0}%).
            {"\n"}4. Average ticket size of{" "}
            {formatCurrency(data.stats.averageInvoiceValue)} indicates healthy
            transaction values.
          </Text>
        </View>
      </View>

      {/* Final Notes */}
      <View
        style={{ marginTop: 20, paddingTop: 10, borderTop: "1 solid #e5e7eb" }}
      >
        <Text style={{ fontSize: 8, color: "#6b7280", textAlign: "center" }}>
          This report was automatically generated by SuvarnaDesk Analytics. Data
          is based on real-time information from your jewelry shop management
          system. For detailed analysis or custom reports, please contact your
          system administrator.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>Page 3 - Performance Trends & Recommendations</Text>
      </View>
      {renderPageNumber({ pageNumber: 3, totalPages: getTotalPages() })}
    </Page>
  );

  return (
    <Document>
      {renderPage1()}
      {renderPage2()}
      {renderPage3()}
    </Document>
  );
};

export default DashboardReportPDF;
