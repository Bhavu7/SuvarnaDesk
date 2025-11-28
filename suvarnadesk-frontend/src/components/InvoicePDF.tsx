import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "/fonts/helvetica-regular.ttf" },
    { src: "/fonts/helvetica-bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  // Main container with border - EXACTLY like receipt sample
  container: {
    border: "2 solid #999999",
    padding: 16,
  },

  // Title section - EXACTLY like receipt sample
  titleSection: {
    textAlign: "left",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1 solid #ddd",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f9e4d",
    marginBottom: 3,
  },

  // Meta info row (Invoice Number, Date) - EXACTLY like receipt sample
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

  // Customer & Seller boxes row - EXACTLY like receipt sample
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

  // Table section - EXACTLY like receipt sample
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

  // Column widths for invoice items
  colProductNo: { flex: 1.2 },
  colDescription: { flex: 1.5 },
  colQty: { flex: 0.6 },
  colWeight: { flex: 0.8 },
  colPrice: { flex: 0.8 },
  colAmount: { flex: 0.8 },

  // Notes & Totals section - EXACTLY like receipt sample
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

  // Signature section - EXACTLY like receipt sample
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

  // Footer text - EXACTLY like receipt sample
  footer: {
    textAlign: "center",
    marginTop: 16,
    paddingTop: 8,
    fontSize: 10,
    color: "#1f9e4d",
    fontWeight: "bold",
  },

  // GST Number style
  gstNumber: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
});

interface InvoiceItem {
  productNo: string;
  description: string;
  quantity: number;
  weight: number;
  pricePerGram: number;
  amount: number;
}

interface InvoicePDFProps {
  data: {
    invoiceNumber: string;
    invoiceDate: string;
    customer: {
      name: string;
      address: string;
      email: string;
      phone: string;
    };
    items: InvoiceItem[];
    grandTotal: number;
    shopSettings: {
      shopName: string;
      gstNumber?: string;
    };
  };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ data }) => {
  // Format date like "01 January 2024"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Format currency without symbol, with commas
  const formatCurrency = (amount: number) => {
    return `$ ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Title - EXACTLY like receipt sample */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>INVOICE</Text>
            {data.shopSettings.gstNumber && (
              <Text style={styles.gstNumber}>
                GST: {data.shopSettings.gstNumber}
              </Text>
            )}
          </View>

          {/* Meta Info Row - EXACTLY like receipt sample */}
          <View style={styles.metaInfoRow}>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Invoice Number:</Text>
              <Text style={styles.metaValue}>#{data.invoiceNumber}</Text>
            </View>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Issued To:</Text>
              <Text style={styles.metaValue}>[1] {data.customer.name}</Text>
            </View>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Date Issued:</Text>
              <Text style={styles.metaValue}>
                {formatDate(data.invoiceDate)}
              </Text>
            </View>
          </View>

          {/* Customer & Seller Boxes - EXACTLY like receipt sample */}
          <View style={styles.boxesRow}>
            {/* Customer Box */}
            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>Customer</Text>
              </View>
              <View style={styles.boxBody}>
                <Text>{data.customer.name}</Text>
                <Text>{data.customer.address}</Text>
                <Text>{data.customer.email}</Text>
                <Text>{data.customer.phone}</Text>
              </View>
            </View>

            {/* Seller Box */}
            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>Seller</Text>
              </View>
              <View style={styles.boxBody}>
                <Text>
                  {data.shopSettings.shopName || "JEWELRY COMMERCIAL"}
                </Text>
                <Text>Professional Jewelry Services</Text>
              </View>
            </View>
          </View>

          {/* Table - EXACTLY like receipt sample */}
          <View style={styles.tableSection}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.colProductNo]}>
                <Text>PRODUCT NO</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colDescription]}>
                <Text>DESCRIPTION</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colQty,
                  styles.tableCellCenter,
                ]}
              >
                <Text>QTY</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colWeight,
                  styles.tableCellRight,
                ]}
              >
                <Text>WEIGHT (g)</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colPrice,
                  styles.tableCellRight,
                ]}
              >
                <Text>PRICE/GRAM</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colAmount,
                  styles.tableCellRight,
                  styles.tableHeaderCellLast,
                ]}
              >
                <Text>AMOUNT</Text>
              </View>
            </View>

            {/* Table Rows */}
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.colProductNo]}>
                  <Text>{item.productNo}</Text>
                </View>
                <View style={[styles.tableCell, styles.colDescription]}>
                  <Text>{item.description}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colQty,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text>{item.quantity}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colWeight,
                    styles.tableCellRight,
                  ]}
                >
                  <Text>{item.weight.toFixed(1)}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colPrice,
                    styles.tableCellRight,
                  ]}
                >
                  <Text>{formatCurrency(item.pricePerGram)}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colAmount,
                    styles.tableCellRight,
                    styles.tableCellLast,
                  ]}
                >
                  <Text>{formatCurrency(item.amount)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Notes & Totals - EXACTLY like receipt sample */}
          <View style={styles.footerSection}>
            <View style={styles.notesBox}>
              <Text>Thank you for your business!</Text>
            </View>
            <View style={styles.totalsBox}>
              <View style={styles.totalRowBold}>
                <Text style={styles.totalBoldLabel}>GRAND TOTAL</Text>
                <Text style={styles.totalBoldValue}>
                  {formatCurrency(data.grandTotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Signature Section - EXACTLY like receipt sample */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Customer Signature</Text>
            </View>
          </View>

          {/* Footer - EXACTLY like receipt sample */}
          <View style={styles.footer}>
            <Text>
              Thank you for choosing us! We hope you enjoy your exquisite
              jewellery.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
