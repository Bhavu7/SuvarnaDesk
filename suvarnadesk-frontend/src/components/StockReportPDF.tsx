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
  goldGstNumber?: string;
  silverGstNumber?: string;
  goldPanNumber?: string;
  silverPanNumber?: string;
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
  gstInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTop: "1 solid #eee",
  },
  gstInfo: {
    fontSize: 8,
    color: "#555",
    fontWeight: "bold",
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

  // Determine report details based on report type
  const getReportDetails = () => {
    switch (data.reportType) {
      case "gold":
        return {
          title: data.ownerName || "JayKrushna Haribhai Soni",
          subtitle: "Gold Jewellery Stock Report",
          gstin: `GSTIN: ${formatGST(data.goldGstNumber)}`,
          pan: `PAN: ${formatPAN(data.goldPanNumber)}`,
          reportLabel: "GOLD STOCK REPORT",
          backgroundColor: "#fff8e1",
          textColor: "#d4af37",
          borderColor: "#d4af37",
        };
      case "silver":
        return {
          title: data.ownerName || "Jay Krushna Haribhai Soni",
          subtitle: "Silver Jewellery Stock Report",
          gstin: `GSTIN: ${formatGST(data.silverGstNumber)}`,
          pan: `PAN: ${formatPAN(data.silverPanNumber)}`,
          reportLabel: "SILVER STOCK REPORT",
          backgroundColor: "#f5f5f5",
          textColor: "#757575",
          borderColor: "#757575",
        };
      default:
        return {
          title: data.shopName || "SuvarnaDesk Jewellery",
          subtitle: "Complete Stock Report",
          gstin: `Gold GSTIN: ${formatGST(
            data.goldGstNumber
          )} | Silver GSTIN: ${formatGST(data.silverGstNumber)}`,
          pan: `Gold PAN: ${formatPAN(
            data.goldPanNumber
          )} | Silver PAN: ${formatPAN(data.silverPanNumber)}`,
          reportLabel: "COMPLETE STOCK REPORT",
          backgroundColor: "#FFFFFF",
          textColor: "#1f9e4d",
          borderColor: "#1f9e4d",
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
          {/* Header with Logo */}
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
              <Text
                style={[styles.subtitle, { color: reportDetails.textColor }]}
              >
                {reportDetails.subtitle}
              </Text>
              <Text style={styles.companyInfo}>{data.shopAddress}</Text>

              <View style={styles.gstInfoRow}>
                <Text
                  style={[styles.gstInfo, { color: reportDetails.textColor }]}
                >
                  {reportDetails.gstin}
                </Text>
                <Text
                  style={[styles.gstInfo, { color: reportDetails.textColor }]}
                >
                  {reportDetails.pan}
                </Text>
              </View>
            </View>
          </View>

          {/* Meta Info Row */}
          <View style={styles.metaInfoRow}>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Report Date & Time:</Text>
              <Text style={styles.metaValue}>
                {formatDateTime(data.reportDateTime)}
              </Text>
            </View>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaLabel}>Total Products:</Text>
              <Text style={styles.metaValue}>{totalProducts}</Text>
            </View>
            {data.reportType === "all" && (
              <View style={styles.metaInfoItem}>
                <Text style={styles.metaLabel}>Report Type:</Text>
                <Text style={styles.metaValue}>Gold & Silver Combined</Text>
              </View>
            )}
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
            (!data.goldGstNumber || !data.goldPanNumber)) ||
          (data.reportType === "silver" &&
            (!data.silverGstNumber || !data.silverPanNumber)) ||
          (data.reportType === "all" &&
            (!data.goldGstNumber || !data.silverGstNumber)) ? (
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
                ? `${reportDetails.title} - Gold Jewellery Stock`
                : data.reportType === "silver"
                ? `${reportDetails.title} - Silver Jewellery Stock`
                : `${reportDetails.title} - Complete Stock Report`}
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
