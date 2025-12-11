import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
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

// Updated interfaces
interface RepairItem {
  description: string;
  quantity: number;
  unitPrice: number;
  weight?: number;
  itemType?: "gold" | "silver" | "other";
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
  shopSettings?: {
    shopName?: string;
    address?: string;
    phone?: string;
    email?: string;
    panNumber?: string;
    gstNumber?: string;
    // Gold-specific
    goldOwnerName?: string;
    goldGstNumber?: string;
    goldPanNumber?: string;
    // Silver-specific
    silverOwnerName?: string;
    silverGstNumber?: string;
    silverPanNumber?: string;
    // Bank details
    bankName?: string;
    bankBranch?: string;
    bankIfsc?: string;
    bankAccountNo?: string;
  };
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
    flex: 1,
  },
  // New header style matching invoice
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
  receiptNumber: {
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
  // Updated column widths
  colDescription: { width: "25%" },
  colItemType: { width: "12%" },
  colWeight: { width: "12%" },
  colQuantity: { width: "10%" },
  colPrice: { width: "12%" },
  colSubtotal: { width: "12%" },
  colTax: { width: "12%" },
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
    marginRight: 20,
  },
  totalsBox: {
    borderTop: "1 solid #1f9e4d",
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "220px",
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
    borderTop: "1 solid #999",
  },
  signatureBlock: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    marginBottom: 6,
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
    borderTop: "1 solid #eee",
  },
});

interface ReceiptPDFProps {
  data: RepairingReceipt;
}

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ data }) => {
  const calculateSubtotal = () => {
    return data.items.reduce(
      (sum: number, item: RepairItem) => sum + item.quantity * item.unitPrice,
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
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
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

  // Helper function to get shop details based on item type
  const getShopDetails = () => {
    const hasGold = data.items.some(
      (item: RepairItem) => item.itemType === "gold"
    );
    const hasSilver = data.items.some(
      (item: RepairItem) => item.itemType === "silver"
    );

    if (!data.shopSettings)
      return {
        shopName: data.companyName,
        address: data.companyAddress,
        pan: "N/A",
        gst: "N/A",
        phone: "",
        bankDetails: "",
      };

    // If there are gold items, use gold shop details
    if (hasGold && data.shopSettings.goldOwnerName) {
      return {
        shopName: data.shopSettings.goldOwnerName,
        address: data.companyAddress,
        pan:
          data.shopSettings.goldPanNumber ||
          data.shopSettings.panNumber ||
          "N/A",
        gst:
          data.shopSettings.goldGstNumber ||
          data.shopSettings.gstNumber ||
          "N/A",
        phone: data.shopSettings.phone || "",
        bankDetails: data.shopSettings.bankName
          ? `Bank: ${data.shopSettings.bankName}, Branch: ${
              data.shopSettings.bankBranch || ""
            }, IFSC: ${data.shopSettings.bankIfsc || ""}, A/C: ${
              data.shopSettings.bankAccountNo || ""
            }`
          : "",
      };
    }
    // If there are silver items, use silver shop details
    else if (hasSilver && data.shopSettings.silverOwnerName) {
      return {
        shopName: data.shopSettings.silverOwnerName,
        address: data.companyAddress,
        pan:
          data.shopSettings.silverPanNumber ||
          data.shopSettings.panNumber ||
          "N/A",
        gst:
          data.shopSettings.silverGstNumber ||
          data.shopSettings.gstNumber ||
          "N/A",
        phone: data.shopSettings.phone || "",
        bankDetails: data.shopSettings.bankName
          ? `Bank: ${data.shopSettings.bankName}, Branch: ${
              data.shopSettings.bankBranch || ""
            }, IFSC: ${data.shopSettings.bankIfsc || ""}, A/C: ${
              data.shopSettings.bankAccountNo || ""
            }`
          : "",
      };
    }
    // Fallback to general shop details
    else {
      return {
        shopName: data.shopSettings.shopName || data.companyName,
        address: data.shopSettings.address || data.companyAddress,
        pan: data.shopSettings.panNumber || "N/A",
        gst: data.shopSettings.gstNumber || "N/A",
        phone: data.shopSettings.phone || "",
        bankDetails: data.shopSettings.bankName
          ? `Bank: ${data.shopSettings.bankName}, Branch: ${
              data.shopSettings.bankBranch || ""
            }, IFSC: ${data.shopSettings.bankIfsc || ""}, A/C: ${
              data.shopSettings.bankAccountNo || ""
            }`
          : "",
      };
    }
  };

  const shopDetails = getShopDetails();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* New Header matching invoice style */}
          <View style={styles.headerSection}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View style={styles.logoContainer}>
                <Image style={styles.logo} src={data.logoUrl || "/logo.png"} />
              </View>
              <View style={styles.leftHeader}>
                <Text style={styles.shopName}>{shopDetails.shopName}</Text>
                <Text style={styles.shopAddress}>{shopDetails.address}</Text>
                {shopDetails.phone && (
                  <Text style={styles.shopAddress}>
                    Phone: {shopDetails.phone}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.rightHeader}>
              <Text style={styles.receiptNumber}>
                REPAIR RECEIPT: {data.receiptNumber}
              </Text>

              <View style={styles.headerRow}>
                <Text style={styles.headerLabel}>Issued Date:</Text>
                <Text style={styles.headerValue}>
                  {formatDate(data.receiptDateTime)}
                </Text>
              </View>

              <View style={styles.headerRow}>
                <Text style={styles.headerLabel}>GSTIN:</Text>
                <Text style={styles.headerValue}>{shopDetails.gst}</Text>
              </View>

              <View style={styles.headerRow}>
                <Text style={styles.headerLabel}>PAN:</Text>
                <Text style={styles.headerValue}>{shopDetails.pan}</Text>
              </View>
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
                <Text>
                  Payment Method:{getPaymentMethodText(data.paymentMethod)}
                </Text>
              </View>
            </View>

            <View style={styles.box}>
              <View style={styles.boxHeader}>
                <Text>Seller</Text>
              </View>
              <View style={styles.boxBody}>
                <Text>Salesperson:{data.salespersonName}</Text>
                {shopDetails.phone && <Text>Phone: {shopDetails.phone}</Text>}
                <Text>GSTIN: </Text>
                {shopDetails.bankDetails && (
                  <Text>Bank: {shopDetails.bankDetails}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Updated Table with new columns */}
          <View style={styles.tableSection}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.colDescription]}>
                <Text>DESCRIPTION</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colItemType]}>
                <Text>TYPE</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colWeight]}>
                <Text>WEIGHT (g)</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colQuantity,
                  styles.tableCellCenter,
                ]}
              >
                <Text>QTY</Text>
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
                <Text>TAX ({data.tax}%)</Text>
              </View>
            </View>

            {/* Table Rows */}
            {data.items.map((item: RepairItem, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.colDescription]}>
                  <Text>{item.description}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colItemType,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text>{item.itemType?.toUpperCase() || "N/A"}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colWeight,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text>{item.weight ? item.weight.toFixed(2) : "0.00"}</Text>
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
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                Notes:
              </Text>
              <Text style={{ fontSize: 8 }}>
                • All repairs are guaranteed for 30 days
              </Text>
              <Text style={{ fontSize: 8 }}>
                • Original parts replaced will be returned
              </Text>
              <Text style={{ fontSize: 8 }}>
                • Subject to terms and conditions
              </Text>
              <Text style={{ fontSize: 8, marginTop: 4 }}>
                • GST included as applicable
              </Text>
              <Text style={{ fontSize: 8 }}>
                • Bank details as per metal type
              </Text>
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
              <Text style={styles.signatureLabel}>Customer Signature</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Salesperson Signature</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Thank you for choosing our repair services!</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
