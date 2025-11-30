import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Simplified styles - keeping your exact UI but removing complex nested structures
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
    flex: 1,
  },
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
    minHeight: 20,
  },
  emptyRow: {
    flexDirection: "row",
    borderBottom: "1 solid #f0f0f0",
    minHeight: 20,
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
  colProductNo: { flex: 1.2 },
  colDescription: { flex: 1.5 },
  colHUID: { flex: 1.0 },
  colQty: { flex: 0.6 },
  colWeight: { flex: 0.8 },
  colPrice: { flex: 0.8 },
  colOtherCharges: { flex: 0.8 },
  colAmount: { flex: 0.8 },
  footerSection: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
    borderTop: "1 solid #1f9e4d",
    paddingTop: 8,
  },
  notesTable: {
    flex: 1,
    border: "1 solid #1f9e4d",
    marginRight: 8,
  },
  notesHeader: {
    backgroundColor: "#1f9e4d",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  notesHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 9,
  },
  notesBody: {
    padding: 8,
    minHeight: 80,
  },
  noteItem: {
    fontSize: 8,
    color: "#333",
    marginBottom: 2,
    lineHeight: 1.2,
  },
  totalsTable: {
    width: "200px",
    border: "1 solid #1f9e4d",
  },
  totalsHeader: {
    backgroundColor: "#1f9e4d",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  totalsHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
  },
  totalsBody: {
    padding: 8,
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
  gstNumber: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
  pageNumber: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 9,
    color: "#666",
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

const SingleInvoicePDF: React.FC<InvoicePDFProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Fixed 11 items per page
  const ITEMS_PER_PAGE = 11;
  const totalPages = Math.ceil(data.items.length / ITEMS_PER_PAGE);

  // Get items for specific page
  const getItemsForPage = (pageIndex: number) => {
    const startIndex = pageIndex * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.items.slice(startIndex, endIndex);
  };

  // Calculate empty rows for specific page (always fill to 11 rows)
  const getEmptyRows = (pageIndex: number) => {
    const itemsForPage = getItemsForPage(pageIndex);
    const emptyRowsCount = Math.max(0, ITEMS_PER_PAGE - itemsForPage.length);
    return Array(emptyRowsCount).fill(null);
  };

  // Render a single page
  const renderPage = (pageIndex: number) => {
    const pageItems = getItemsForPage(pageIndex);
    const emptyRows = getEmptyRows(pageIndex);
    const isLastPage = pageIndex === totalPages - 1;

    return (
      <Page key={pageIndex} size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header - Show on every page */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{data.shopSettings.shopName}</Text>
            {data.shopSettings.gstNumber && (
              <Text style={styles.gstNumber}>
                GST: {data.shopSettings.gstNumber}
              </Text>
            )}
          </View>

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

          <View style={styles.boxesRow}>
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

            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>Seller</Text>
              </View>
              <View style={styles.boxBody}>
                <Text>{data.shopSettings.shopName}</Text>
                <Text>Professional Jewelry Services</Text>
              </View>
            </View>
          </View>

          {/* Table Section */}
          <View style={styles.tableSection}>
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
                  styles.colHUID,
                  styles.tableCellCenter,
                ]}
              >
                <Text>HUID</Text>
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

            {/* Actual Items */}
            {pageItems.map((item, index) => {
              const globalIndex = pageIndex * ITEMS_PER_PAGE + index;
              return (
                <View key={globalIndex} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.colProductNo]}>
                    <Text>{item.productNo}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.colDescription]}>
                    <Text>{item.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colHUID,
                      styles.tableCellCenter,
                    ]}
                  >
                    <Text>{data.customer.huid || "-"}</Text>
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
              );
            })}

            {/* Empty Rows to maintain 11 rows per page */}
            {emptyRows.map((_, index) => (
              <View key={`empty-${pageIndex}-${index}`} style={styles.emptyRow}>
                <View style={[styles.tableCell, styles.colProductNo]}>
                  <Text> </Text>
                </View>
                <View style={[styles.tableCell, styles.colDescription]}>
                  <Text> </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colHUID,
                    styles.tableCellCenter,
                  ]}
                >
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

          {/* Footer Section - Only on last page */}
          {isLastPage && (
            <>
              <View style={styles.footerSection}>
                <View style={styles.notesTable}>
                  <View style={styles.notesHeader}>
                    <Text style={styles.notesHeaderText}>NOTES</Text>
                  </View>
                  <View style={styles.notesBody}>
                    <Text style={styles.noteItem}>
                      • All weights are in grams
                    </Text>
                    <Text style={styles.noteItem}>
                      • GST included as applicable
                    </Text>
                    <Text style={styles.noteItem}>
                      • Goods once sold cannot be returned
                    </Text>
                  </View>
                </View>

                <View style={styles.totalsTable}>
                  <View style={styles.totalsHeader}>
                    <Text style={styles.totalsHeaderText}>TOTALS</Text>
                  </View>
                  <View style={styles.totalsBody}>
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
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total GST:</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(data.CGSTAmount + data.SGSTAmount)}
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
              </View>

              <View style={styles.signatureSection}>
                <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>
                    Authorized Signature
                  </Text>
                </View>
                <View style={styles.signatureBlock}>
                  {/* Empty space for customer signature */}
                </View>
              </View>

              <View style={styles.footer}>
                <Text>
                  Thank you for choosing us! We hope you enjoy your exquisite
                  jewellery.
                </Text>
              </View>
            </>
          )}

          {/* Page Number */}
          <View style={styles.pageNumber}>
            <Text>
              Page {pageIndex + 1} of {totalPages}
            </Text>
          </View>
        </View>
      </Page>
    );
  };

  return (
    <Document>
      {Array.from({ length: totalPages }, (_, pageIndex) =>
        renderPage(pageIndex)
      )}
    </Document>
  );
};

export default SingleInvoicePDF;
