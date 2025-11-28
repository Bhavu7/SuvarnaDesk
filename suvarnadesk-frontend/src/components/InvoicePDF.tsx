// components/InvoicePDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (you might need to adjust these)
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

  // Header Section
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

  // Two Column Layout
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  leftColumn: {
    width: "48%",
  },

  rightColumn: {
    width: "48%",
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

  // Table Styles
  table: {
    marginTop: 20,
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottom: "1 solid #000",
    paddingVertical: 8,
    paddingHorizontal: 5,
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

  // Column widths matching the sample
  colProductNo: {
    width: "15%",
  },

  colDescription: {
    width: "25%",
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
    width: "17%",
    textAlign: "right",
  },

  colAmount: {
    width: "18%",
    textAlign: "right",
  },

  // Total Section
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2 solid #000",
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },

  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },

  // Payment Information
  paymentSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: "1 solid #ddd",
  },

  paymentTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
  },

  // Signature Section
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #ddd",
  },

  signatureBox: {
    width: "45%",
  },

  signatureLine: {
    borderBottom: "1 solid #000",
    marginBottom: 5,
    height: 30,
  },

  signatureLabel: {
    fontSize: 9,
    textAlign: "center",
    fontStyle: "italic",
  },

  // Footer
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
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
    company: {
      name: string;
      address: string;
    };
    items: InvoiceItem[];
    grandTotal: number;
    paymentInfo: {
      bankName: string;
      accountNo: string;
    };
  };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.companyName}>JEWELRY COMMERCIAL</Text>
          </View>
        </View>

        {/* Invoice Number and Customer Details */}
        <View style={styles.twoColumn}>
          <View style={styles.leftColumn}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Invoice No.:</Text>
              <Text style={styles.fieldValue}>#{data.invoiceNumber}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Issued to:</Text>
              <Text style={styles.fieldValue}>[1] {data.customer.name}</Text>
              <Text style={styles.fieldValue}>{data.customer.address}</Text>
              <Text style={styles.fieldValue}>{data.customer.email}</Text>
              <Text style={styles.fieldValue}>{data.customer.phone}</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date Issued:</Text>
              <Text style={styles.fieldValue}>{data.invoiceDate}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
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
                <Text>$ {item.pricePerGram.toFixed(2)}</Text>
              </View>
              <View style={[styles.tableCell, styles.colAmount]}>
                <Text>$ {item.amount.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Grand Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>GRAND TOTAL</Text>
          <Text style={styles.totalValue}>$ {data.grandTotal.toFixed(2)}</Text>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Information</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Bank Name: {data.paymentInfo.bankName}
            </Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Account No: {data.paymentInfo.accountNo}
            </Text>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Customer Signature [2]</Text>
          </View>
        </View>

        {/* Footer */}
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
