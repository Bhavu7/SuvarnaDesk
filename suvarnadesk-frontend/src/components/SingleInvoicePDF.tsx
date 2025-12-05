import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register fonts (keep as is)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "/fonts/helvetica-regular.ttf" },
    { src: "/fonts/helvetica-bold.ttf", fontWeight: "bold" },
  ],
});

Font.register({
  family: "DejaVu",
  src: "/fonts/DejaVuSans.ttf",
});

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
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "1 solid #ddd",
  },
  leftHeader: {
    flex: 1,
    marginRight: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f9e4d",
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 10,
    color: "#333",
    marginBottom: 2,
    lineHeight: 1.4,
  },
  rightHeader: {
    alignItems: "flex-end",
    width: "30%",
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
    fontSize: 8,
  },
  headerLabel: {
    fontWeight: "bold",
    color: "#666",
    width: "35%",
  },
  headerValue: {
    color: "#333",
    width: "65%",
    textAlign: "right",
    fontSize: 8,
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 16,
  },
  box: {
    flex: 1,
    border: "1 solid #ccc",
    borderRadius: 4,
  },
  boxHeader: {
    backgroundColor: "#1f9e4d",
    paddingVertical: 6,
    paddingHorizontal: 10,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  boxBody: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 9,
    color: "#333",
    lineHeight: 1.5,
  },
  boxRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  boxLabel: {
    fontWeight: "bold",
    width: "40%",
  },
  boxValue: {
    width: "60%",
  },
  tableSection: {
    marginBottom: 10,
    border: "1 solid #1f9e4d",
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f9e4d",
    borderBottom: "1 solid #1f9e4d",
  },
  tableHeaderCell: {
    paddingVertical: 8,
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
    minHeight: 28,
  },
  tableCell: {
    paddingVertical: 6,
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
  colProductNo: { width: "12%" },
  colDescription: { width: "28%" },
  colHSN: { width: "12%" },
  colQty: { width: "8%" },
  colWeight: { width: "10%" },
  colPrice: { width: "10%" },
  colOtherCharges: { width: "10%" },
  colAmount: { width: "10%" },
  footerSection: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  notesBox: {
    flex: 1,
    borderTop: "1 solid #1f9e4d",
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 9,
    color: "#333",
    marginRight: 20,
  },
  notesTitle: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    fontSize: 10,
  },
  notesList: {
    marginLeft: 8,
  },
  noteItem: {
    fontSize: 8.5,
    color: "#333",
    marginBottom: 3,
    lineHeight: 1.3,
  },
  totalsBox: {
    borderTop: "1 solid #1f9e4d",
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "220px",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 9.5,
  },
  totalLabel: {
    color: "#666",
  },
  totalValue: {
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    minWidth: 80,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1 solid #ddd",
    fontSize: 11,
    fontWeight: "bold",
  },
  totalBoldLabel: {
    color: "#1f9e4d",
  },
  totalBoldValue: {
    color: "#1f9e4d",
    textAlign: "right",
    minWidth: 80,
  },
  totalInWords: {
    marginTop: 2,
    padding: 2,
    fontSize: 8,
    color: "#333",
    lineHeight: 1.1,
    fontStyle: "italic",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #999",
  },
  signatureBlock: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    marginBottom: 6,
    minHeight: 50,
  },
  signatureLabel: {
    fontSize: 10,
    color: "#1f9e4d",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    paddingTop: 10,
    fontSize: 10,
    color: "#1f9e4d",
    fontWeight: "bold",
    borderTop: "1 solid #eee",
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
  metalType?: "gold" | "silver"; // Add metal type to distinguish
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
      hsnCode: string;
      gstin?: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    CGSTPercent: number;
    CGSTAmount: number;
    SGSTPercent: number;
    SGSTAmount: number;
    grandTotal: number;
    grandTotalInWords: string;
    shopSettings: {
      shopName: string;
      ownerName: string;
      gstNumber?: string;
      panNumber?: string;
      address: string;
      phone?: string;
      bankDetails?: string; // Keep for backward compatibility
      logoUrl?: string;

      // Gold Details
      goldOwnerName?: string;
      goldGstNumber?: string;
      goldPanNumber?: string;
      goldBankName?: string;
      goldBankBranch?: string;
      goldBankIfsc?: string;
      goldBankAccountNo?: string;

      // Silver Details
      silverOwnerName?: string;
      silverGstNumber?: string;
      silverPanNumber?: string;
      silverBankName?: string;
      silverBankBranch?: string;
      silverBankIfsc?: string;
      silverBankAccountNo?: string;
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
    return `₹${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  // Helper function to detect metal type from description
  const detectMetalType = (description: string): "gold" | "silver" => {
    const desc = description.toLowerCase();
    if (desc.includes("gold") || desc.includes("gd") || desc.includes("gld")) {
      return "gold";
    }
    if (
      desc.includes("silver") ||
      desc.includes("slv") ||
      desc.includes("sv")
    ) {
      return "silver";
    }
    // Default to gold if can't detect
    return "gold";
  };

  // Determine which bank details to use based on items
  const getBankDetailsForInvoice = () => {
    // Check if all items are of the same metal type
    const metalTypes = data.items.map(
      (item) => item.metalType || detectMetalType(item.description)
    );
    const hasGold = metalTypes.includes("gold");
    const hasSilver = metalTypes.includes("silver");

    // If mixed items, use a combined message
    if (hasGold && hasSilver) {
      return "Multiple bank accounts - Refer to settings";
    }

    // If only gold or only silver
    if (hasGold) {
      const goldDetails = [];
      if (data.shopSettings.goldBankName) {
        goldDetails.push(`Bank: ${data.shopSettings.goldBankName}`);
      }
      if (data.shopSettings.goldBankBranch) {
        goldDetails.push(`Branch: ${data.shopSettings.goldBankBranch}`);
      }
      if (data.shopSettings.goldBankIfsc) {
        goldDetails.push(`IFSC: ${data.shopSettings.goldBankIfsc}`);
      }
      if (data.shopSettings.goldBankAccountNo) {
        goldDetails.push(`A/C: ${data.shopSettings.goldBankAccountNo}`);
      }
      return goldDetails.join(", ");
    }

    if (hasSilver) {
      const silverDetails = [];
      if (data.shopSettings.silverBankName) {
        silverDetails.push(`Bank: ${data.shopSettings.silverBankName}`);
      }
      if (data.shopSettings.silverBankBranch) {
        silverDetails.push(`Branch: ${data.shopSettings.silverBankBranch}`);
      }
      if (data.shopSettings.silverBankIfsc) {
        silverDetails.push(`IFSC: ${data.shopSettings.silverBankIfsc}`);
      }
      if (data.shopSettings.silverBankAccountNo) {
        silverDetails.push(`A/C: ${data.shopSettings.silverBankAccountNo}`);
      }
      return silverDetails.join(", ");
    }

    // Fallback to old bankDetails field
    return data.shopSettings.bankDetails || "To be added in settings";
  };

  // Determine which owner name to use based on items
  const getOwnerNameForInvoice = () => {
    const metalTypes = data.items.map(
      (item) => item.metalType || detectMetalType(item.description)
    );
    const hasGold = metalTypes.includes("gold");
    const hasSilver = metalTypes.includes("silver");

    if (hasGold && !hasSilver && data.shopSettings.goldOwnerName) {
      return data.shopSettings.goldOwnerName;
    }
    if (hasSilver && !hasGold && data.shopSettings.silverOwnerName) {
      return data.shopSettings.silverOwnerName;
    }

    // Mixed or fallback
    return data.shopSettings.ownerName || "Shop Owner";
  };

  // Determine which GST to use based on items
  const getGSTForInvoice = () => {
    const metalTypes = data.items.map(
      (item) => item.metalType || detectMetalType(item.description)
    );
    const hasGold = metalTypes.includes("gold");
    const hasSilver = metalTypes.includes("silver");

    if (hasGold && !hasSilver && data.shopSettings.goldGstNumber) {
      return data.shopSettings.goldGstNumber;
    }
    if (hasSilver && !hasGold && data.shopSettings.silverGstNumber) {
      return data.shopSettings.silverGstNumber;
    }

    // Mixed or fallback
    return data.shopSettings.gstNumber || "N/A";
  };

  // Determine which PAN to use based on items
  const getPANForInvoice = () => {
    const metalTypes = data.items.map(
      (item) => item.metalType || detectMetalType(item.description)
    );
    const hasGold = metalTypes.includes("gold");
    const hasSilver = metalTypes.includes("silver");

    if (hasGold && !hasSilver && data.shopSettings.goldPanNumber) {
      return data.shopSettings.goldPanNumber;
    }
    if (hasSilver && !hasGold && data.shopSettings.silverPanNumber) {
      return data.shopSettings.silverPanNumber;
    }

    // Mixed or fallback
    return data.shopSettings.panNumber || "N/A";
  };

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(data.items.length / ITEMS_PER_PAGE);

  // Get the appropriate values for this invoice
  const bankDetails = getBankDetailsForInvoice();
  const ownerName = getOwnerNameForInvoice();
  const gstNumber = getGSTForInvoice();
  const panNumber = getPANForInvoice();

  const renderPage = (pageIndex: number) => {
    const startIndex = pageIndex * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageItems = data.items.slice(startIndex, endIndex);
    const isLastPage = pageIndex === totalPages - 1;

    return (
      <Page key={pageIndex} size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header Section with Logo and Invoice Info */}
          <View style={styles.headerSection}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View style={styles.logoContainer}>
                <Image
                  style={styles.logo}
                  src={data.shopSettings.logoUrl || "/logo.png"}
                />
              </View>
              <View style={styles.leftHeader}>
                <Text style={styles.shopName}>{ownerName}</Text>
                <Text style={styles.shopAddress}>
                  {data.shopSettings.address}
                </Text>
                {data.shopSettings.phone && (
                  <Text style={styles.shopAddress}>
                    Phone: {data.shopSettings.phone}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.rightHeader}>
              <Text style={styles.invoiceNumber}>
                INVOICE: {data.invoiceNumber}
              </Text>

              <View style={styles.headerRow}>
                <Text style={styles.headerLabel}>Issued Date:</Text>
                <Text style={styles.headerValue}>
                  {formatDate(data.invoiceDate)}
                </Text>
              </View>

              <View style={styles.headerRow}>
                <Text style={styles.headerLabel}>GSTIN:</Text>
                <Text style={styles.headerValue}>{gstNumber}</Text>
              </View>

              <View style={styles.headerRow}>
                <Text style={styles.headerLabel}>PAN:</Text>
                <Text style={styles.headerValue}>{panNumber}</Text>
              </View>
            </View>
          </View>

          {/* Seller and Customer Information */}
          <View style={styles.boxesRow}>
            {/* Seller Box - Left */}
            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>SELLER</Text>
              </View>
              <View style={styles.boxBody}>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Name:</Text>
                  <Text style={styles.boxValue}>{ownerName}</Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Address:</Text>
                  <Text style={styles.boxValue}>
                    {data.shopSettings.address}
                  </Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>GSTIN:</Text>
                  <Text style={styles.boxValue}>{gstNumber}</Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>PAN:</Text>
                  <Text style={styles.boxValue}>{panNumber}</Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Bank Details:</Text>
                  <Text style={styles.boxValue}>{bankDetails}</Text>
                </View>
              </View>
            </View>

            {/* Customer Box - Right */}
            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>CUSTOMER</Text>
              </View>
              <View style={styles.boxBody}>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Name:</Text>
                  <Text style={styles.boxValue}>{data.customer.name}</Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Address:</Text>
                  <Text style={styles.boxValue}>
                    {data.customer.address || "N/A"}
                  </Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Phone:</Text>
                  <Text style={styles.boxValue}>{data.customer.phone}</Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Email:</Text>
                  <Text style={styles.boxValue}>
                    {data.customer.email || "N/A"}
                  </Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>GSTIN:</Text>
                  <Text style={styles.boxValue}>
                    {data.customer.gstin || "N/A"}
                  </Text>
                </View>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>State:</Text>
                  <Text style={styles.boxValue}>Gujarat /2</Text>
                </View>
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
                  styles.colHSN,
                  styles.tableCellCenter,
                ]}
              >
                <Text>HSN CODE</Text>
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

            {pageItems.map((item, index) => {
              const globalIndex = startIndex + index;
              return (
                <View key={globalIndex} style={styles.tableRow}>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colProductNo,
                      styles.tableCellCenter,
                    ]}
                  >
                    <Text>{item.productNo}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.colDescription]}>
                    <Text>{item.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colHSN,
                      styles.tableCellCenter,
                    ]}
                  >
                    <Text>{data.customer.hsnCode || "-"}</Text>
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
                    <Text>{item.weight.toFixed(2)}</Text>
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
          </View>

          {/* Footer Sections - Only on last page */}
          {isLastPage && (
            <>
              <View style={styles.footerSection}>
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>NOTES:</Text>
                  <View style={styles.notesList}>
                    <Text style={styles.noteItem}>
                      • All weights are in grams
                    </Text>
                    <Text style={styles.noteItem}>
                      • GST included as applicable
                    </Text>
                    <Text style={styles.noteItem}>
                      • Goods once sold cannot be returned
                    </Text>
                    <Text style={styles.noteItem}>
                      • Subject to Anand jurisdiction
                    </Text>
                    <Text style={styles.noteItem}>
                      • Bank details are specific to metal type
                    </Text>
                  </View>
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

                  {/* Total in Words */}
                  <View style={styles.totalInWords}>
                    <Text>Total in Words: {data.grandTotalInWords}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.signatureSection}>
                <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>
                    Authorized Signature (Seller)
                  </Text>
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

          {/* Show page number if multiple pages */}
          {totalPages > 1 && (
            <View style={styles.pageNumber}>
              <Text>
                Page {pageIndex + 1} of {totalPages}
              </Text>
            </View>
          )}
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
