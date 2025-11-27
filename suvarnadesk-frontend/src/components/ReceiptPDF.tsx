import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional - for better typography)
// Font.register({
//   family: "Arial",
//   fonts: [
//     { src: "/fonts/arial.ttf" },
//     { src: "/fonts/arial-bold.ttf", fontWeight: "bold" },
//   ],
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottom: "2 solid #2563eb",
    paddingBottom: 15,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 10,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridItem: {
    width: "48%",
  },
  card: {
    backgroundColor: "#f8fafc",
    border: "1 solid #e2e8f0",
    padding: 12,
    borderRadius: 4,
  },
  metaContainer: {
    backgroundColor: "#dbeafe",
    border: "1 solid #93c5fd",
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  tableHeader: {
    backgroundColor: "#1e40af",
    color: "#FFFFFF",
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  table: {
    width: "100%",
    border: "1 solid #d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #d1d5db",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    borderBottom: "1 solid #93c5fd",
  },
  tableCol: {
    padding: 8,
    borderRight: "1 solid #d1d5db",
  },
  tableColHeader: {
    padding: 8,
    borderRight: "1 solid #93c5fd",
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e40af",
  },
  colDescription: {
    width: "55%",
  },
  colQuantity: {
    width: "10%",
    textAlign: "center",
  },
  colUnitPrice: {
    width: "15%",
    textAlign: "right",
  },
  colAmount: {
    width: "20%",
    textAlign: "right",
    borderRight: "none",
  },
  totalsContainer: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalsWrapper: {
    width: 250,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottom: "1 solid #e5e7eb",
  },
  totalRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTop: "2 solid #9ca3af",
    marginTop: 4,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  totalValue: {
    fontWeight: "bold",
  },
  totalMainLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
  },
  totalMainValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
  },
  footer: {
    borderTop: "1 solid #d1d5db",
    paddingTop: 20,
    marginTop: 30,
  },
  footerText: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
  },
  footerThankYou: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 6,
  },
});

interface RepairItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface RepairingReceipt {
  receiptNumber: string;
  receiptDateTime: string;
  paymentMethod: string;
  customerName: string;
  customerAddress: string;
  companyName: string;
  companyAddress: string;
  items: RepairItem[];
  salespersonName: string;
  tax: number;
}

interface ReceiptPDFProps {
  data: RepairingReceipt;
}

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ data }) => {
  const calculateSubtotal = () => {
    return data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTax = () => {
    return (calculateSubtotal() * data.tax) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: "Cash",
      card: "Card",
      cheque: "Cheque",
      upi: "UPI",
      bank_transfer: "Bank Transfer",
    };
    return methods[method] || method;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{data.companyName}</Text>
          <Text style={styles.companyInfo}>{data.companyAddress}</Text>
          <Text style={styles.companyInfo}>
            +91-98765-43210 | info@suvarnadesk.com
          </Text>
        </View>

        {/* Bill From / Bill To */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>BILL FROM</Text>
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                {data.companyName}
              </Text>
              <Text style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>
                {data.companyAddress}
              </Text>
              <Text style={{ fontSize: 9, color: "#9ca3af", marginTop: 4 }}>
                GSTIN: 07AABCU9603R1ZM
              </Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>BILL TO</Text>
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                {data.customerName}
              </Text>
              <Text style={{ fontSize: 10, color: "#6b7280" }}>
                {data.customerAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Receipt Meta Information */}
        <View style={styles.metaContainer}>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>RECEIPT NO.</Text>
              <Text style={styles.metaValue}>{data.receiptNumber}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>DATE & TIME</Text>
              <Text style={styles.metaValue}>
                {formatDate(data.receiptDateTime)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>PAYMENT METHOD</Text>
              <Text style={styles.metaValue}>
                {getPaymentMethodText(data.paymentMethod)}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Details Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>SERVICE DETAILS</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.colDescription]}>
              <Text>Description</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colQuantity]}>
              <Text>Qty</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colUnitPrice]}>
              <Text>Unit Price</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colAmount]}>
              <Text>Amount (₹)</Text>
            </View>
          </View>

          {/* Table Rows */}
          {data.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                { backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f9fafb" },
              ]}
            >
              <View style={[styles.tableCol, styles.colDescription]}>
                <Text style={{ fontSize: 10 }}>{item.description}</Text>
              </View>
              <View style={[styles.tableCol, styles.colQuantity]}>
                <Text style={{ fontSize: 10, textAlign: "center" }}>
                  {item.quantity}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.colUnitPrice]}>
                <Text style={{ fontSize: 10, textAlign: "right" }}>
                  ₹{item.unitPrice.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  ₹{(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsWrapper}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                ₹{calculateSubtotal().toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({data.tax}%):</Text>
              <Text style={styles.totalValue}>
                ₹{calculateTax().toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRowMain}>
              <Text style={styles.totalMainLabel}>Total Amount:</Text>
              <Text style={styles.totalMainValue}>
                ₹{calculateTotal().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information */}
        <View style={[styles.gridContainer, { marginTop: 25 }]}>
          <View style={styles.gridItem}>
            <Text style={styles.sectionTitle}>SERVICE INFORMATION</Text>
            <Text style={{ fontSize: 10, marginBottom: 2 }}>
              <Text style={{ fontWeight: "bold" }}>Service Engineer:</Text>{" "}
              {data.salespersonName}
            </Text>
            <Text style={{ fontSize: 10, marginBottom: 2 }}>
              <Text style={{ fontWeight: "bold" }}>Warranty:</Text> 90 days on
              service
            </Text>
            <Text style={{ fontSize: 10 }}>
              <Text style={{ fontWeight: "bold" }}>Service Type:</Text> AC
              Repair & Maintenance
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
            <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 1 }}>
              • Warranty covers service labor only
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 1 }}>
              • Parts warranty as per manufacturer
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 1 }}>
              • Original receipt required for claims
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280" }}>
              • Service response within 24 hours
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerThankYou}>
            Thank you for choosing {data.companyName}
          </Text>
          <Text style={styles.footerText}>
            For support: support@suvarnadesk.com | ☎ +91-98765-43210 | 🌐
            www.suvarnadesk.com
          </Text>
          <Text style={[styles.footerText, { marginTop: 8 }]}>
            This is a computer-generated receipt. No signature required.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
