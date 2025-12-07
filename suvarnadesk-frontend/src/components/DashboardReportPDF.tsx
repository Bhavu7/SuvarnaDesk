// components/DashboardReportPDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Create styles first (without font specification)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    color: "#1f2937",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #3b82f6",
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
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
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1 solid #e5e7eb",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    border: "1 solid #e5e7eb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    flex: 1,
    color: "white",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRowEven: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    color: "#374151",
  },
  tableCellBold: {
    fontSize: 8,
    color: "#111827",
  },
  progressBar: {
    height: 5,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
});

interface DashboardReportPDFProps {
  data: {
    timeRange: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
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
      totalInvoices: number;
      totalSpent: number;
      frequency: number;
    }>;
  };
}

const DashboardReportPDF: React.FC<DashboardReportPDFProps> = ({ data }) => {
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard Analytics Report</Text>
          <Text style={styles.headerSubtitle}>
            Jewelry Shop Performance Analysis
          </Text>
          <Text style={styles.headerDate}>
            Period: {formatDate(data.dateRange.startDate)} -{" "}
            {formatDate(data.dateRange.endDate)}
          </Text>
          <Text style={styles.headerDate}>
            Generated on: {new Date().toLocaleDateString("en-IN")}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.grid}>
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
              <Text style={styles.metricValue}>
                {data.stats.totalCustomers}
              </Text>
              <Text style={styles.metricSubtitle}>
                {data.stats.newCustomersThisPeriod} new this period
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Total Invoices</Text>
              <Text style={styles.metricValue}>{data.stats.totalInvoices}</Text>
              <Text style={styles.metricSubtitle}>
                Avg: {formatCurrency(data.stats.averageInvoiceValue)} per
                invoice
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Peak Performance</Text>
              <Text style={[styles.metricValue, { fontSize: 14 }]}>
                {data.stats.peakDay}
              </Text>
              <Text style={styles.metricSubtitle}>
                Top metal: {data.stats.topMetal}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method Distribution</Text>
          {data.paymentDistribution.map((payment, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
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
                <Text style={{ fontSize: 9 }}>
                  {payment.value}% ({payment.count} transactions)
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${payment.value}%`,
                      backgroundColor: payment.color,
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

        {/* Top Customers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Customers (Top 5)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
                Customer
              </Text>
              <Text style={styles.tableHeaderCell}>Phone</Text>
              <Text style={styles.tableHeaderCell}>Invoices</Text>
              <Text style={styles.tableHeaderCell}>Total Spent</Text>
            </View>
            {data.topCustomers.slice(0, 5).map((customer, index) => (
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
                <Text style={[styles.tableCell, { color: "#059669" }]}>
                  {formatCurrency(customer.totalSpent)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>SuvarnaDesk - Jewelry Shop Management System</Text>
          <Text>Confidential Report - For Internal Use Only</Text>
        </View>
        <Text style={styles.pageNumber}>Page 1 of 1</Text>
      </Page>
    </Document>
  );
};

export default DashboardReportPDF;
