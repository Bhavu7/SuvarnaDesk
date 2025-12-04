import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export interface StockProduct {
  srNo: number;
  productNo: string;
  name: string;
  productType: "gold" | "silver";
  quantity: number;
  hsnCode: string;
  weight: number;
  weightUnit: string;
}

interface StockReportData {
  reportDateTime: string;
  shopName: string;
  shopAddress: string;
  logoUrl?: string;
  products: StockProduct[];
  reportType: "gold" | "silver" | "all";
  ownerName: string;
  gstNumber?: string;
  panNumber?: string;
  // For "all" type reports
  goldGstNumber?: string;
  silverGstNumber?: string;
  goldPanNumber?: string;
  silverPanNumber?: string;
  goldOwnerName?: string;
  silverOwnerName?: string;
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
    alignItems: "flex-start",
    marginBottom: 10,
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyInfo: {
    fontSize: 9,
    color: "#333",
    marginBottom: 1,
  },
  // New style for right-aligned tax info
  taxInfoColumn: {
    width: "40%",
    alignItems: "flex-end",
    paddingLeft: 10,
    marginTop: 5,
  },
  taxInfoItem: {
    fontSize: 8,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "right",
  },
  reportDate: {
    fontSize: 8,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "right",
  },
  metaInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 10,
    marginTop: 8,
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
  tableSection: {
    marginBottom: 8,
    border: "1 solid #1f9e4d",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f9e4d",
    borderBottom: "1 solid #1a7a3d",
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
    minHeight: 20,
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
  colSrNo: { width: "7%" },
  colProductNo: { width: "14%" },
  colName: { width: "25%" },
  colType: { width: "9%" },
  colQty: { width: "9%" },
  colHSN: { width: "11%" },
  colWeight: { width: "25%" },
  totalsRowWrapper: {
    marginTop: 8,
    borderTop: "1 solid #1f9e4d",
    paddingTop: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    marginBottom: 4,
  },
  totalsLabel: {
    fontWeight: "bold",
    color: "#1f9e4d",
  },
  totalsValue: {
    fontWeight: "bold",
    color: "#333",
  },
  footer: {
    textAlign: "center",
    marginTop: 16,
    paddingTop: 8,
    fontSize: 10,
    fontWeight: "bold",
  },
  reportTypeBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  emptyInfo: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#999",
  },
});

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format GST number for display
const formatGST = (gstNumber?: string): string => {
  if (!gstNumber || gstNumber.trim() === "") return "Not set";
  if (gstNumber.length >= 15) {
    return `${gstNumber.slice(0, 2)}-${gstNumber.slice(2, 7)}-${gstNumber.slice(
      7,
      11
    )}-${gstNumber.slice(11, 12)}-${gstNumber.slice(12, 13)}-${gstNumber.slice(
      13,
      15
    )}`;
  }
  return gstNumber;
};

// Format PAN number for display
const formatPAN = (panNumber?: string): string => {
  if (!panNumber || panNumber.trim() === "") return "Not set";
  return panNumber.toUpperCase();
};

interface StockReportPDFProps {
  data: StockReportData;
}

const StockReportPDF: React.FC<StockReportPDFProps> = ({ data }) => {
  const totalProducts = data.products.length;
  const totalQuantity = data.products.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0
  );

  const goldProducts = data.products.filter((p) => p.productType === "gold");
  const silverProducts = data.products.filter(
    (p) => p.productType === "silver"
  );

  const goldWeight = goldProducts.reduce((sum, p) => sum + (p.weight || 0), 0);
  const silverWeight = silverProducts.reduce(
    (sum, p) => sum + (p.weight || 0),
    0
  );
  const totalWeight = goldWeight + silverWeight;

  // Format report date for top right display
  const formatReportDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Determine report details based on report type
  const getReportDetails = () => {
    switch (data.reportType) {
      case "gold":
        return {
          title:
            data.ownerName || data.goldOwnerName || "Jay Krushna Haribhai Soni",
          gstin: formatGST(data.gstNumber || data.goldGstNumber),
          pan: formatPAN(data.panNumber || data.goldPanNumber),
          reportLabel: "GOLD STOCK REPORT",
          backgroundColor: "#fff8e1",
          textColor: "#d4af37",
          borderColor: "#d4af37",
          isGold: true,
        };
      case "silver":
        return {
          title:
            data.ownerName ||
            data.silverOwnerName ||
            "M/s Yogeshkumar and Brothers",
          gstin: formatGST(data.gstNumber || data.silverGstNumber),
          pan: formatPAN(data.panNumber || data.silverPanNumber),
          reportLabel: "SILVER STOCK REPORT",
          backgroundColor: "#f5f5f5",
          textColor: "#757575",
          borderColor: "#757575",
          isGold: false,
        };
      default:
        return {
          title: data.shopName || "SuvarnaDesk Jewellery",
          subtitle: "Complete Stock Report",
          gstin: data.goldGstNumber
            ? `Gold: ${formatGST(data.goldGstNumber)}`
            : "Not set",
          pan: data.goldPanNumber
            ? `Gold: ${formatPAN(data.goldPanNumber)}`
            : "Not set",
          silverGstin: data.silverGstNumber
            ? `Silver: ${formatGST(data.silverGstNumber)}`
            : "Not set",
          silverPan: data.silverPanNumber
            ? `Silver: ${formatPAN(data.silverPanNumber)}`
            : "Not set",
          reportLabel: "COMPLETE STOCK REPORT",
          backgroundColor: "#FFFFFF",
          textColor: "#1f9e4d",
          borderColor: "#1f9e4d",
          isGold: false,
        };
    }
  };

  const reportDetails = getReportDetails();

  return (
    <Document>
      <Page
        size="A4"
        style={[
          styles.page,
          { backgroundColor: reportDetails.backgroundColor },
        ]}
      >
        {/* Report Type Badge */}
        <View
          style={[
            styles.reportTypeBadge,
            { backgroundColor: reportDetails.textColor },
          ]}
        >
          <Text style={{ color: "#fff" }}>{reportDetails.reportLabel}</Text>
        </View>

        <View
          style={[styles.container, { borderColor: reportDetails.borderColor }]}
        >
          {/* Header with Logo and Right-aligned GST/PAN/Date */}
          <View style={styles.headerSection}>
            {data.logoUrl && (
              <View style={styles.logoContainer}>
                <Image style={styles.logo} src={data.logoUrl} />
              </View>
            )}
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: reportDetails.textColor }]}>
                {reportDetails.title}
              </Text>
              <Text style={styles.companyInfo}>{data.shopAddress}</Text>
            </View>

            {/* Right-aligned GST, PAN and Date */}
            <View style={styles.taxInfoColumn}>
              {/* Report Date at top */}
              <Text style={styles.reportDate}>
                Report Date: {formatReportDate(data.reportDateTime)}
              </Text>

              {/* GSTIN */}
              {data.reportType === "all" ? (
                <>
                  <Text style={[styles.taxInfoItem, { color: "#d4af37" }]}>
                    {reportDetails.gstin}
                  </Text>
                  <Text style={[styles.taxInfoItem, { color: "#d4af37" }]}>
                    {reportDetails.pan}
                  </Text>
                  <Text style={[styles.taxInfoItem, { color: "#757575" }]}>
                    {reportDetails.silverGstin || "Silver GSTIN: Not set"}
                  </Text>
                  <Text style={[styles.taxInfoItem, { color: "#757575" }]}>
                    {reportDetails.silverPan || "Silver PAN: Not set"}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.taxInfoItem,
                      { color: reportDetails.textColor },
                    ]}
                  >
                    GSTIN: {reportDetails.gstin}
                  </Text>
                  <Text
                    style={[
                      styles.taxInfoItem,
                      { color: reportDetails.textColor },
                    ]}
                  >
                    PAN: {reportDetails.pan}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Products Table */}
          <View
            style={[
              styles.tableSection,
              { borderColor: reportDetails.borderColor },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.tableHeader,
                { backgroundColor: reportDetails.borderColor },
              ]}
            >
              <View style={[styles.tableHeaderCell, styles.colSrNo]}>
                <Text>SR NO</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colProductNo]}>
                <Text>PRODUCT NO</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colName]}>
                <Text>PRODUCT NAME</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colType]}>
                <Text>TYPE</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colQty]}>
                <Text>QTY</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.colHSN]}>
                <Text>HSN CODE</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.colWeight,
                  styles.tableHeaderCellLast,
                ]}
              >
                <Text>WEIGHT</Text>
              </View>
            </View>

            {/* Rows */}
            {data.products.map((p) => (
              <View key={p.srNo} style={styles.tableRow}>
                <View
                  style={[
                    styles.tableCell,
                    styles.colSrNo,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text>{p.srNo}</Text>
                </View>
                <View style={[styles.tableCell, styles.colProductNo]}>
                  <Text>{p.productNo}</Text>
                </View>
                <View style={[styles.tableCell, styles.colName]}>
                  <Text>{p.name}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colType,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text
                    style={
                      p.productType === "gold"
                        ? { color: "#d4af37", fontWeight: "bold" }
                        : { color: "#757575", fontWeight: "bold" }
                    }
                  >
                    {p.productType.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colQty,
                    styles.tableCellCenter,
                  ]}
                >
                  <Text>{p.quantity}</Text>
                </View>
                <View style={[styles.tableCell, styles.colHSN]}>
                  <Text>{p.hsnCode || "-"}</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colWeight,
                    styles.tableCellRight,
                    styles.tableCellLast,
                  ]}
                >
                  <Text>
                    {p.weight.toFixed(2)} {p.weightUnit || "g"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Totals at bottom */}
          <View style={styles.totalsRowWrapper}>
            {data.reportType === "all" && (
              <>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, { color: "#d4af37" }]}>
                    Gold Products:
                  </Text>
                  <Text style={[styles.totalsValue, { color: "#d4af37" }]}>
                    {goldProducts.length}
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, { color: "#757575" }]}>
                    Silver Products:
                  </Text>
                  <Text style={[styles.totalsValue, { color: "#757575" }]}>
                    {silverProducts.length}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Products:</Text>
              <Text style={styles.totalsValue}>{totalProducts}</Text>
            </View>

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Quantity:</Text>
              <Text style={styles.totalsValue}>{totalQuantity}</Text>
            </View>

            {data.reportType === "all" && (
              <>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, { color: "#d4af37" }]}>
                    Gold Weight:
                  </Text>
                  <Text style={[styles.totalsValue, { color: "#d4af37" }]}>
                    {goldWeight.toFixed(2)} g
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, { color: "#757575" }]}>
                    Silver Weight:
                  </Text>
                  <Text style={[styles.totalsValue, { color: "#757575" }]}>
                    {silverWeight.toFixed(2)} g
                  </Text>
                </View>
              </>
            )}

            <View style={styles.totalsRow}>
              <Text
                style={[
                  styles.totalsLabel,
                  { fontSize: 11, color: reportDetails.textColor },
                ]}
              >
                Total Weight:
              </Text>
              <Text
                style={[
                  styles.totalsValue,
                  { fontSize: 11, color: reportDetails.textColor },
                ]}
              >
                {totalWeight.toFixed(2)} g
              </Text>
            </View>
          </View>

          {/* Tax Information Note */}
          {(data.reportType === "gold" &&
            (!data.gstNumber ||
              !data.panNumber ||
              !data.goldGstNumber ||
              !data.goldPanNumber)) ||
          (data.reportType === "silver" &&
            (!data.gstNumber ||
              !data.panNumber ||
              !data.silverGstNumber ||
              !data.silverPanNumber)) ||
          (data.reportType === "all" &&
            (!data.goldGstNumber ||
              !data.silverGstNumber ||
              !data.goldPanNumber ||
              !data.silverPanNumber)) ? (
            <View
              style={{
                marginTop: 8,
                padding: 6,
                backgroundColor: "#fff3cd",
                borderRadius: 4,
              }}
            >
              <Text
                style={{ fontSize: 8, color: "#856404", textAlign: "center" }}
              >
                ⚠️ Please set GST and PAN numbers in Shop Settings for proper
                invoicing
              </Text>
            </View>
          ) : null}

          {/* Footer with Report Type */}
          <View style={styles.footer}>
            <Text style={{ color: reportDetails.textColor }}>
              {data.reportType === "gold"
                ? `Gold Jewellery Stock Report - ${reportDetails.title}`
                : data.reportType === "silver"
                ? `Silver Jewellery Stock Report - ${reportDetails.title}`
                : `Complete Stock Report - ${data.shopName}`}
            </Text>
            <Text style={{ fontSize: 9, color: "#666", marginTop: 4 }}>
              Generated on{" "}
              {new Date(data.reportDateTime).toLocaleDateString("en-IN")} • Page
              1 of 1
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default StockReportPDF;
