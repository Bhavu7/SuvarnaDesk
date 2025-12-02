import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

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
  logoUrl?: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  container: {
    border: "2 solid #999999",
    padding: 16,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1 solid #ddd",
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f9e4d",
    marginBottom: 3,
  },
  companyInfo: {
    fontSize: 9,
    color: "#666",
  },
  metaInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 10,
  },
  metaInfoItem: {
    flex: 1,
  },
  metaLabel: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  metaValue: {
    color: "#333",
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 16,
  },
  box: {
    flex: 1,
    border: "1 solid #ccc",
  },
  boxHeader: {
    backgroundColor: "#1f9e4d",
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },
  boxBody: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 50,
    fontSize: 9,
    color: "#333",
    lineHeight: 1.4,
  },
  tableSection: {
    marginBottom: 8,
    border: "1 solid #1f9e4d",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f9e4d",
    borderBottom: "1 solid #1f9e4d",
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
    borderRight: "1 solid #1a7a3d",
  },
  tableHeaderCellLast: {
    borderRight: "none",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    minHeight: 24,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 9,
    color: "#333",
    justifyContent: "center",
    borderRight: "1 solid #eee",
  },
  tableCellLast: {
    borderRight: "none",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellRight: {
    textAlign: "right",
  },
  colDescription: { flex: 2 },
  colQuantity: { flex: 0.8 },
  colPrice: { flex: 0.8 },
  colSubtotal: { flex: 0.8 },
  colTax: { flex: 0.8 },
  footerSection: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
  },
  notesBox: {
    flex: 1,
    borderTop: "1 solid #1f9e4d",
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 9,
    color: "#333",
  },
  totalsBox: {
    borderTop: "1 solid #1f9e4d",
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "200px",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 9,
  },
  totalLabel: {
    color: "#666",
  },
  totalValue: {
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    minWidth: 70,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1 solid #ddd",
    fontSize: 10,
    fontWeight: "bold",
  },
  totalBoldLabel: {
    color: "#1f9e4d",
  },
  totalBoldValue: {
    color: "#1f9e4d",
    textAlign: "right",
    minWidth: 70,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    paddingTop: 12,
  },
  signatureBlock: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    borderTop: "1 solid #999",
    width: "100%",
    marginBottom: 4,
    minHeight: 40,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#1f9e4d",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    marginTop: 16,
    paddingTop: 8,
    fontSize: 10,
    color: "#1f9e4d",
    fontWeight: "bold",
  },
});

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
        <View style={styles.container}>
          {/* Header with Logo */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo} src={data.logoUrl || "/logo.png"} />
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.title}>AC Repair Receipt</Text>
              <Text style={styles.companyInfo}>{data.companyName}</Text>
              <Text style={styles.companyInfo}>{data.companyAddress}</Text>
            </View>
          </View>

          {/* Meta Info Row */}
          <View style={styles.metaInfoRow}>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Receipt Number:</Text>
              <Text style={styles.metaValue}>{data.receiptNumber}</Text>
            </View>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Payment Method:</Text>
              <Text style={styles.metaValue}>
                {getPaymentMethodText(data.paymentMethod)}
              </Text>
            </View>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Receipt Date:</Text>
              <Text style={styles.metaValue}>
                {formatDate(data.receiptDateTime)}
              </Text>
            </View>
          </View>

          {/* Customer & Seller Boxes */}
          <View style={styles.boxesRow}>
            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>Customer</Text>
              </View>
              <View style={styles.boxBody}>
                <Text>{data.customerName}</Text>
                <Text>{data.customerAddress}</Text>
              </View>
            </View>

            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>Seller</Text>
              </View>
              <View style={styles.boxBody}>
                <Text>{data.companyName}</Text>
                <Text>{data.companyAddress}</Text>
              </View>
            </View>
          </View>

          {/* Table */}
          <View style={styles.tableSection}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.colDescription]}>
                <Text>DESCRIPTION</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colQuantity,
                  styles.tableCellCenter,
                ]}
              >
                <Text>QUANTITY</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colPrice,
                  styles.tableCellRight,
                ]}
              >
                <Text>UNIT PRICE</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colSubtotal,
                  styles.tableCellRight,
                ]}
              >
                <Text>SUBTOTAL</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colTax,
                  styles.tableCellRight,
                  styles.tableHeaderCellLast,
                ]}
              >
                <Text>TAX</Text>
              </View>
            </View>

            {/* Table Rows */}
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.colDescription]}>
                  <Text>{item.description}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colQuantity,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text>{item.quantity}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colPrice,
                    styles.tableCellRight,
                  ]}
                >
                  <Text>₹{item.unitPrice.toFixed(2)}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colSubtotal,
                    styles.tableCellRight,
                  ]}
                >
                  <Text>₹{(item.quantity * item.unitPrice).toFixed(2)}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colTax,
                    styles.tableCellRight,
                    styles.tableCellLast,
                  ]}
                >
                  <Text>
                    ₹
                    {(
                      (item.quantity * item.unitPrice * data.tax) /
                      100
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Notes & Totals */}
          <View style={styles.footerSection}>
            <View style={styles.notesBox}>
              <Text>[Notes]</Text>
            </View>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SUBTOTAL</Text>
                <Text style={styles.totalValue}>
                  ₹{calculateSubtotal().toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TAX ({data.tax}%)</Text>
                <Text style={styles.totalValue}>
                  ₹{calculateTax().toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRowBold}>
                <Text style={styles.totalBoldLabel}>TOTAL</Text>
                <Text style={styles.totalBoldValue}>
                  ₹{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Salesperson</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Thank you for the payment!</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
