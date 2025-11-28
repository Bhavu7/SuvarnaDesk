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
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Header Section - Match sample exactly
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: "1 solid #000",
    paddingBottom: 10,
  },

  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },

  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },

  // Two Column Layout - Match sample spacing
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  leftColumn: {
    width: "50%",
  },

  rightColumn: {
    width: "45%",
    alignItems: "flex-end",
  },

  // Field Styles
  fieldGroup: {
    marginBottom: 8,
  },

  fieldLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#333",
  },

  fieldValue: {
    fontSize: 10,
    color: "#000",
  },

  customerAddress: {
    fontSize: 10,
    color: "#000",
    marginTop: 2,
  },

  // Table Styles - Match sample exactly
  table: {
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
  },

  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: "#f8f8f8",
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    paddingVertical: 8,
    paddingHorizontal: 5,
    minHeight: 30,
  },

  tableCell: {
    paddingHorizontal: 5,
    justifyContent: "center",
  },

  // Column widths matching the sample exactly
  colProductNo: {
    width: "18%",
    textAlign: "left",
  },

  colDescription: {
    width: "25%",
    textAlign: "left",
  },

  colQty: {
    width: "10%",
    textAlign: "center",
  },

  colWeight: {
    width: "15%",
    textAlign: "right",
  },

  colPrice: {
    width: "16%",
    textAlign: "right",
  },

  colAmount: {
    width: "16%",
    textAlign: "right",
  },

  // Total Section - Match sample
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2 solid #000",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },

  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },

  // Signature Section - Match sample
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingTop: 15,
  },

  signatureBox: {
    width: "45%",
  },

  signatureLine: {
    borderBottom: "1 solid #000",
    marginBottom: 5,
    height: 20,
  },

  signatureLabel: {
    fontSize: 9,
    textAlign: "center",
    fontStyle: "italic",
  },

  // Footer - Match sample
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
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
        {/* Header - Match sample exactly */}
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.companyName}>
              {data.shopSettings.shopName || "JEWELRY COMMERCIAL"}
            </Text>
            {data.shopSettings.gstNumber && (
              <Text style={styles.gstNumber}>
                GST: {data.shopSettings.gstNumber}
              </Text>
            )}
          </View>
        </View>

        {/* Invoice Number and Customer Details - Match sample layout */}
        <View style={styles.twoColumn}>
          <View style={styles.leftColumn}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Invoice No.:</Text>
              <Text style={styles.fieldValue}>#{data.invoiceNumber}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Issued to:</Text>
              <Text style={styles.fieldValue}>[1] {data.customer.name}</Text>
              <Text style={styles.customerAddress}>
                {data.customer.address}
              </Text>
              <Text style={styles.customerAddress}>{data.customer.email}</Text>
              <Text style={styles.customerAddress}>{data.customer.phone}</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date Issued:</Text>
              <Text style={styles.fieldValue}>
                {formatDate(data.invoiceDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Table - Match sample exactly */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableCell, styles.colProductNo]}>
              <Text>PRODUCT/ SERVICE NO</Text>
            </View>
            <View style={[styles.tableCell, styles.colDescription]}>
              <Text>DESCRIPTION</Text>
            </View>
            <View style={[styles.tableCell, styles.colQty]}>
              <Text>QTY</Text>
            </View>
            <View style={[styles.tableCell, styles.colWeight]}>
              <Text>WEIGHT (grams)</Text>
            </View>
            <View style={[styles.tableCell, styles.colPrice]}>
              <Text>PRICE/GRAM</Text>
            </View>
            <View style={[styles.tableCell, styles.colAmount]}>
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
              <View style={[styles.tableCell, styles.colQty]}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={[styles.tableCell, styles.colWeight]}>
                <Text>{item.weight.toFixed(1)}</Text>
              </View>
              <View style={[styles.tableCell, styles.colPrice]}>
                <Text>{formatCurrency(item.pricePerGram)}</Text>
              </View>
              <View style={[styles.tableCell, styles.colAmount]}>
                <Text>{formatCurrency(item.amount)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Grand Total - Match sample */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>GRAND TOTAL</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(data.grandTotal)}
          </Text>
        </View>

        {/* Signature Section - Match sample */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Customer Signature [2]</Text>
          </View>
        </View>

        {/* Footer - Match sample exactly */}
        <View style={styles.footer}>
          <Text>
            Thank you for choosing us! We hope you enjoy your exquisite
            jewellery.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;