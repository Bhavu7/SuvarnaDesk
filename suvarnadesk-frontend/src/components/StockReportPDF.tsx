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
  colSrNo: { width: "8%" },
  colProductNo: { width: "14%" },
  colName: { width: "26%" },
  colType: { width: "10%" },
  colQty: { width: "10%" },
  colHSN: { width: "12%" },
  colWeight: { width: "20%" },
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
    color: "#1f9e4d",
    fontWeight: "bold",
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
              <Text style={styles.title}>Stock Report</Text>
              <Text style={styles.companyInfo}>{data.shopName}</Text>
              <Text style={styles.companyInfo}>
                {data.shopAddress ||
                  "near ashok stambh, choksi bazar anand 388001"}
              </Text>
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
          </View>

          {/* Products Table */}
          <View style={styles.tableSection}>
            {/* Header */}
            <View style={styles.tableHeader}>
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
                  <Text>{p.productType.toUpperCase()}</Text>
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
                  <Text>{p.hsnCode}</Text>
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
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Products:</Text>
              <Text style={styles.totalsValue}>{totalProducts}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Gold Products:</Text>
              <Text style={styles.totalsValue}>{goldProducts.length}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Silver Products:</Text>
              <Text style={styles.totalsValue}>{silverProducts.length}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Quantity:</Text>
              <Text style={styles.totalsValue}>{totalQuantity}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Gold Weight:</Text>
              <Text style={styles.totalsValue}>
                {goldWeight.toFixed(2)} (sum of entered units)
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Silver Weight:</Text>
              <Text style={styles.totalsValue}>
                {silverWeight.toFixed(2)} (sum of entered units)
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Weight:</Text>
              <Text style={styles.totalsValue}>
                {totalWeight.toFixed(2)} (sum of entered units)
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Thank you for using SuvarnaDesk!</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default StockReportPDF;
