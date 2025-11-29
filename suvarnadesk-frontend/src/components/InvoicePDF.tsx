import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts with rupee symbol support
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "/fonts/helvetica-regular.ttf" },
    { src: "/fonts/helvetica-bold.ttf", fontWeight: "bold" },
  ],
});

// Register a font that supports rupee symbol if needed, or use Unicode
Font.register({
  family: "DejaVu",
  src: "/fonts/DejaVuSans.ttf", // You can use any font that supports rupee symbol
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
    flex: 1,
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

  // HUID display style
  huidText: {
    fontSize: 8,
    color: "#666",
    marginTop: 2,
    fontWeight: "bold",
  },

  // Table section - EXACTLY like receipt sample
  tableSection: {
    marginBottom: 8,
    border: "1 solid #1f9e4d",
    flex: 1,
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

  // Empty row style
  emptyRow: {
    flexDirection: "row",
    borderBottom: "1 solid #f0f0f0",
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

  // Column widths for invoice items - updated for other charges
  colProductNo: { flex: 1.2 },
  colDescription: { flex: 1.5 },
  colQty: { flex: 0.6 },
  colWeight: { flex: 0.8 },
  colPrice: { flex: 0.8 },
  colOtherCharges: { flex: 0.8 },
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
  otherCharges: number;
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
      huid?: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    CGSTPercent: number;
    CGSTAmount: number;
    SGSTPercent: number;
    SGSTAmount: number;
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

  // Format currency with proper rupee symbol using Unicode
  const formatCurrency = (amount: number) => {
    // Using Unicode rupee symbol (₹) - works in most modern fonts
    return `₹${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  // Alternative format without symbol if rupee symbol doesn't render
  const formatCurrencyAlt = (amount: number) => {
    return `Rs. ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  // Calculate dynamic empty rows based on content height
  const calculateDynamicEmptyRows = () => {
    // Fixed heights for different sections
    const titleSectionHeight = 40;
    const metaInfoHeight = 30;
    const customerBoxesHeight = 80;
    const tableHeaderHeight = 25;
    const itemRowHeight = 24;
    const footerSectionHeight = 50;
    const signatureSectionHeight = 70;
    const footerHeight = 30;

    // Total available height on A4 page (approx 700px minus margins)
    const totalAvailableHeight = 650;

    // Calculate used height
    const usedHeight =
      titleSectionHeight +
      metaInfoHeight +
      customerBoxesHeight +
      tableHeaderHeight +
      data.items.length * itemRowHeight +
      footerSectionHeight +
      signatureSectionHeight +
      footerHeight;

    // Calculate remaining space
    const remainingSpace = totalAvailableHeight - usedHeight;

    // If we have extra space, calculate how many empty rows we can fit
    if (remainingSpace > itemRowHeight) {
      const emptyRowsCount = Math.floor(remainingSpace / itemRowHeight);
      return Array(Math.max(0, emptyRowsCount)).fill(null);
    }

    return [];
  };

  const emptyRows = calculateDynamicEmptyRows();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Title - EXACTLY like receipt sample */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>COMMERCIAL INVOICE</Text>
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
              <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
            </View>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Issued To:</Text>
              <Text style={styles.metaValue}>{data.customer.name}</Text>
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
                {/* HUID Display - Only show if available */}
                {data.customer.huid && (
                  <Text style={styles.huidText}>
                    HUID: {data.customer.huid}
                  </Text>
                )}
              </View>
            </View>

            {/* Seller Box */}
            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>Seller</Text>
              </View>
              <View style={styles.boxBody}>
                <Text>
                  {data.shopSettings.shopName || "JEWELRY COMMERCIAL INVOICE"}
                </Text>
                <Text>Professional Jewelry Services</Text>
              </View>
            </View>
          </View>

          {/* Table - EXACTLY like receipt sample */}
          <View style={styles.tableSection}>
            {/* Table Header - Updated for other charges */}
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
              {/* Other Charges column */}
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colOtherCharges,
                  styles.tableCellRight,
                ]}
              >
                <Text>OTHER CHGS</Text>
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

            {/* Table Rows - Actual Data */}
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
                {/* Other Charges cell */}
                <View
                  style={[
                    styles.tableCell,
                    styles.colOtherCharges,
                    styles.tableCellRight,
                  ]}
                >
                  <Text>{formatCurrency(item.otherCharges)}</Text>
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

            {/* Dynamic Empty Rows to Fill the Page */}
            {emptyRows.map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptyRow}>
                <View style={[styles.tableCell, styles.colProductNo]}>
                  <Text> </Text>
                </View>
                <View style={[styles.tableCell, styles.colDescription]}>
                  <Text> </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colQty,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text> </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colWeight,
                    styles.tableCellRight,
                  ]}
                >
                  <Text> </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colPrice,
                    styles.tableCellRight,
                  ]}
                >
                  <Text> </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colOtherCharges,
                    styles.tableCellRight,
                  ]}
                >
                  <Text> </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colAmount,
                    styles.tableCellRight,
                    styles.tableCellLast,
                  ]}
                >
                  <Text> </Text>
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
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(data.subtotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  CGST ({data.CGSTPercent}%):
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(data.CGSTAmount)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  SGST ({data.SGSTPercent}%):
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(data.SGSTAmount)}
                </Text>
              </View>
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
