// pages/Billing.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdDelete,
  MdReceipt,
  MdQrCode,
  MdCurrencyRupee,
  MdCalculate,
  MdDownload,
  MdRefresh,
} from "react-icons/md";
import { useCustomers, Customer } from "../hooks/useCustomers";
import { useLabourCharges, LabourCharge } from "../hooks/useLabourCharges";
import { useMetalRates, MetalRate } from "../hooks/useMetalRates";
import { useLiveRates, LiveRate } from "../hooks/useLiveRates";
import { useCreateInvoice, LineItem } from "../hooks/useBilling";
import CustomDropdown from "../components/CustomDropdown";
import InvoiceQRCode from "../components/InvoiceQRCode";
import { showToast } from "../components/CustomToast";
import SingleInvoicePDF from "../components/SingleInvoicePDF";
import DateDropdown from "../components/DateDropdown";
import { PDFDownloadLink } from "@react-pdf/renderer";
import apiClient from "../api/apiClient";

interface PdfData {
  invoiceNumber: string;
  invoiceDate: string;
  customer: {
    name: string;
    address: string;
    email: string;
    phone: string;
    huid: string;
  };
  items: Array<{
    productNo: string;
    description: string;
    quantity: number;
    weight: number;
    pricePerGram: number;
    otherCharges: number;
    amount: number;
  }>;
  subtotal: number;
  CGSTPercent: number;
  CGSTAmount: number;
  SGSTPercent: number;
  SGSTAmount: number;
  grandTotal: number;
  shopSettings: {
    shopName: string;
    gstNumber?: string;
    gstType?: string;
  };
}

export default function Billing() {
  const { data: customers } = useCustomers();
  const { data: labourCharges } = useLabourCharges();
  const { data: metalRates } = useMetalRates();
  const {
    data: liveRates,
    refetch: refetchLiveRates,
    isLoading: liveRatesLoading,
  } = useLiveRates();
  const createInvoice = useCreateInvoice();

  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [customerHUID, setCustomerHUID] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [generatingInvoiceNumber, setGeneratingInvoiceNumber] = useState(false);
  const [useLiveRatesEnabled, setUseLiveRatesEnabled] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      itemType: "gold",
      purity: "24K",
      description: "",
      weight: { value: 0, unit: "g" },
      ratePerGram: 0,
      labourChargeReferenceId: "",
      labourChargeType: null,
      labourChargeAmount: 0,
      makingChargesTotal: 0,
      otherCharges: 0,
      itemTotal: 0,
    },
  ]);
  const [CGSTPercent, setCGSTPercent] = useState<number>(1.5);
  const [SGSTPercent, setSGSTPercent] = useState<number>(1.5);
  const [paymentMode, setPaymentMode] = useState<string>("cash");
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<PdfData[] | null>(null);

  // Fetch shop settings and generate invoice number on component mount
  React.useEffect(() => {
    generateInvoiceNumber();
  }, []);

  // Auto-refresh live rates when component mounts
  useEffect(() => {
    if (useLiveRatesEnabled) {
      refetchLiveRates();
    }
  }, [useLiveRatesEnabled, refetchLiveRates]);

  const generateInvoiceNumber = async (): Promise<string> => {
    try {
      setGeneratingInvoiceNumber(true);
      const response = await apiClient.get("/invoices");
      const invoices = response.data || [];

      let highestNumber = 0;
      if (invoices.length > 0) {
        invoices.forEach((invoice: any) => {
          const match = invoice.invoiceNumber.match(/INV-(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1]);
            if (num > highestNumber) {
              highestNumber = num;
            }
          }
        });
      }

      const nextNumber = highestNumber + 1;
      const newInvoiceNumber = `INV-${nextNumber}`;
      setInvoiceNumber(newInvoiceNumber);
      return newInvoiceNumber;
    } catch (error) {
      console.error("Failed to generate invoice number:", error);
      const fallbackNumber = "INV-1";
      setInvoiceNumber(fallbackNumber);
      return fallbackNumber;
    } finally {
      setGeneratingInvoiceNumber(false);
    }
  };

  // Custom dropdown options
  const itemTypeOptions = [
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
    { value: "other", label: "Other" },
  ];

  const purityOptions = {
    gold: [
      { value: "24K", label: "24K" },
      { value: "22K", label: "22K" },
      { value: "18K", label: "18K" },
    ],
    silver: [
      { value: "Standard", label: "Standard" },
      { value: "Sterling", label: "Sterling" },
    ],
    other: [{ value: "Standard", label: "Standard" }],
  };

  const weightUnitOptions = [
    { value: "kg", label: "kg" },
    { value: "g", label: "g" },
    { value: "mg", label: "mg" },
    { value: "tola", label: "tola" },
  ];

  const paymentModeOptions = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "cheque", label: "Cheque" },
    { value: "metalExchange", label: "Metal Exchange" },
    { value: "bankTransfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  const convertToGrams = (value: number, unit: string): number => {
    switch (unit) {
      case "kg":
        return value * 1000;
      case "g":
        return value;
      case "mg":
        return value / 1000;
      case "tola":
        return value * 11.66;
      default:
        return value;
    }
  };

  // Get rate for item - uses live rates if enabled, falls back to metal rates
  const getRateForItem = (itemType: string, purity: string): number => {
    if (useLiveRatesEnabled && liveRates && liveRates.length > 0) {
      const liveRate = liveRates.find(
        (rate: LiveRate) =>
          rate.metalType === itemType && rate.purity === purity && rate.isActive
      );
      if (liveRate) {
        return liveRate.ratePerGram;
      }
    }

    // Fallback to metal rates
    const metalRate = metalRates?.find(
      (rate: MetalRate) =>
        rate.metalType === itemType && rate.purity === purity && rate.isActive
    );
    return metalRate?.ratePerGram || 0;
  };

  const subtotal: number = lineItems.reduce(
    (acc, item) => acc + item.itemTotal,
    0
  );
  const CGSTAmount = (subtotal * CGSTPercent) / 100;
  const SGSTAmount = (subtotal * SGSTPercent) / 100;
  const grandTotal = subtotal + CGSTAmount + SGSTAmount;
  const totalGST = CGSTAmount + SGSTAmount;

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    if (customerId) {
      const customer = customers?.find((c: Customer) => c._id === customerId);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerEmail(customer.email || "");
        setCustomerPhone(customer.phone);
        setCustomerAddress(customer.address || "");
        setCustomerHUID(customer.huid || "");
      }
    } else {
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerHUID("");
    }
  };

  const handleLineItemChange = (
    index: number,
    field:
      | keyof LineItem
      | "weightValue"
      | "weightUnit"
      | "labourChargeReferenceId"
      | "otherCharges",
    value: string | number | null
  ) => {
    const updatedItems = [...lineItems];
    const item = updatedItems[index];

    if (field === "weightValue" || field === "weightUnit") {
      if (field === "weightValue") item.weight.value = Number(value) || 0;
      else if (typeof value === "string") item.weight.unit = value;

      item.ratePerGram = getRateForItem(item.itemType, item.purity);

      const weightInGrams = convertToGrams(item.weight.value, item.weight.unit);
      const metalPrice = weightInGrams * item.ratePerGram;

      const labourCharge = labourCharges?.find(
        (lc: LabourCharge) => lc._id === item.labourChargeReferenceId
      );

      let labourChargeAmount = 0;
      if (labourCharge) {
        labourChargeAmount =
          labourCharge.chargeType === "perGram"
            ? weightInGrams * labourCharge.amount
            : labourCharge.amount;
      }

      item.labourChargeAmount = labourChargeAmount;
      item.makingChargesTotal = labourChargeAmount;
      item.itemTotal = metalPrice + labourChargeAmount + item.otherCharges;
    }

    if (field === "labourChargeReferenceId" && typeof value === "string") {
      item.labourChargeReferenceId = value;

      const labourCharge = labourCharges?.find(
        (lc: LabourCharge) => lc._id === value
      );
      const weightInGrams = convertToGrams(item.weight.value, item.weight.unit);
      let labourChargeAmount = 0;
      if (labourCharge) {
        labourChargeAmount =
          labourCharge.chargeType === "perGram"
            ? weightInGrams * labourCharge.amount
            : labourCharge.amount;
      }
      item.labourChargeAmount = labourChargeAmount;
      item.makingChargesTotal = labourChargeAmount;
      item.itemTotal =
        weightInGrams * item.ratePerGram +
        labourChargeAmount +
        item.otherCharges;
    }

    if (field === "otherCharges") {
      item.otherCharges = Number(value) || 0;
      const weightInGrams = convertToGrams(item.weight.value, item.weight.unit);
      const metalPrice = weightInGrams * item.ratePerGram;
      item.itemTotal = metalPrice + item.labourChargeAmount + item.otherCharges;
    }

    if (
      ![
        "weightValue",
        "weightUnit",
        "labourChargeReferenceId",
        "otherCharges",
      ].includes(field)
    ) {
      // @ts-ignore
      item[field] = value;
    }

    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        itemType: "gold",
        purity: "24K",
        description: "",
        weight: { value: 0, unit: "g" },
        ratePerGram: getRateForItem("gold", "24K"),
        labourChargeReferenceId: "",
        labourChargeType: null,
        labourChargeAmount: 0,
        makingChargesTotal: 0,
        otherCharges: 0,
        itemTotal: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedItems = lineItems.filter((_, i) => i !== index);
      setLineItems(updatedItems);
      showToast.success("Item removed");
    } else {
      showToast.error("At least one item is required");
    }
  };

  // Refresh rates manually
  const handleRefreshRates = async () => {
    try {
      await refetchLiveRates();
      showToast.success("Rates refreshed successfully");

      const updatedItems = lineItems.map((item) => ({
        ...item,
        ratePerGram: getRateForItem(item.itemType, item.purity),
      }));
      setLineItems(updatedItems);
    } catch (error) {
      showToast.error("Failed to refresh rates");
    }
  };

  // Live Rates Status Indicator
  const renderLiveRatesIndicator = () => {
    if (!useLiveRatesEnabled) return null;

    const lastUpdated =
      liveRates && liveRates.length > 0
        ? new Date(liveRates[0].lastUpdated)
        : null;

    const minutesAgo = lastUpdated
      ? Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000)
      : null;

    const availableMetals = liveRates
      ? Array.from(new Set(liveRates.map((rate) => rate.metalType)))
      : [];

    return (
      <div className="p-4 mt-4 bg-white border border-blue-100 rounded-lg">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Connection Status:</span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  liveRatesLoading
                    ? "bg-yellow-500 animate-pulse"
                    : liveRates && liveRates.length > 0
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span
                className={`font-medium ${
                  liveRatesLoading
                    ? "text-yellow-600"
                    : liveRates && liveRates.length > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {liveRatesLoading
                  ? "Connecting..."
                  : liveRates && liveRates.length > 0
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Update:</span>
            <span className="font-medium text-gray-800">
              {minutesAgo !== null
                ? `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`
                : "Never"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Available Metals:</span>
            <div className="flex gap-2">
              {availableMetals.length > 0 ? (
                availableMetals.map((metal) => (
                  <span
                    key={metal}
                    className="px-2 py-1 text-xs font-medium text-blue-800 capitalize bg-blue-100 rounded"
                  >
                    {metal}
                  </span>
                ))
              ) : (
                <span className="text-xs text-red-500">No rates loaded</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Active Rates:</span>
            <span className="font-medium text-gray-800">
              {liveRates ? liveRates.length : 0}
            </span>
          </div>
        </div>

        {liveRates && liveRates.length > 0 && (
          <div className="pt-3 mt-3 border-t border-gray-100">
            <h4 className="mb-2 text-xs font-semibold text-gray-700">
              Current Rates:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {liveRates.slice(0, 4).map((rate, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 text-xs rounded bg-gray-50"
                >
                  <span className="text-gray-600 capitalize">
                    {rate.metalType} {rate.purity}
                  </span>
                  <span className="font-semibold text-green-600">
                    ₹{rate.ratePerGram.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            {liveRates.length > 4 && (
              <div className="mt-2 text-xs text-center text-gray-500">
                +{liveRates.length - 4} more rates available
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Fixed handleSubmit function
  const handleSubmit = async () => {
    if (!customerName.trim()) {
      showToast.error("Please enter customer name");
      return;
    }

    if (!customerPhone.trim()) {
      showToast.error("Please enter customer phone number");
      return;
    }

    if (lineItems.some((item) => item.weight.value === 0)) {
      showToast.error("Please enter weight for all items");
      return;
    }

    if (createInvoice.isPending) return;

    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber || finalInvoiceNumber.includes("timestamp")) {
      finalInvoiceNumber = await generateInvoiceNumber();
    }

    if (!finalInvoiceNumber.trim()) {
      showToast.error("Invoice number is required");
      return;
    }

    try {
      const shopSettingsResponse = await apiClient.get("/shop-settings");
      const shopData = shopSettingsResponse.data || {};

      const goldGstNumber = shopData.goldGstNumber || "";
      const silverGstNumber = shopData.silverGstNumber || "";
      const shopName = shopData.shopName || "JEWELRY COMMERCIAL INVOICE";

      const goldItems = lineItems.filter((item) => item.itemType === "gold");
      const silverItems = lineItems.filter(
        (item) => item.itemType === "silver"
      );
      const otherItems = lineItems.filter((item) => item.itemType === "other");

      const calculateTotals = (items: LineItem[], applyGST: boolean = true) => {
        const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);
        let CGSTAmount = 0;
        let SGSTAmount = 0;
        let grandTotal = subtotal;

        if (applyGST) {
          CGSTAmount = (subtotal * CGSTPercent) / 100;
          SGSTAmount = (subtotal * SGSTPercent) / 100;
          grandTotal = subtotal + CGSTAmount + SGSTAmount;
        }

        return {
          subtotal,
          CGSTAmount,
          SGSTAmount,
          grandTotal,
          totalGST: CGSTAmount + SGSTAmount,
        };
      };

      const goldTotals = calculateTotals(goldItems);
      const silverTotals = calculateTotals(silverItems);
      const otherTotals = calculateTotals(otherItems, false);

      const pdfDataArray: PdfData[] = [];

      if (goldItems.length > 0) {
        const goldPdfData = {
          invoiceNumber: finalInvoiceNumber,
          invoiceDate,
          customer: {
            name: customerName,
            address: customerAddress,
            email: customerEmail,
            phone: customerPhone,
            huid: customerHUID,
          },
          items: goldItems.map((item, index) => ({
            productNo: `GOLD-${index + 1}`,
            description: `${item.itemType.toUpperCase()} ${item.purity} ${
              item.description
            }`.trim(),
            quantity: 1,
            weight: convertToGrams(item.weight.value, item.weight.unit),
            pricePerGram: item.ratePerGram,
            otherCharges: item.otherCharges || 0,
            amount: item.itemTotal,
          })),
          subtotal: goldTotals.subtotal,
          CGSTPercent: goldItems.length > 0 ? CGSTPercent : 0,
          CGSTAmount: goldTotals.CGSTAmount,
          SGSTPercent: goldItems.length > 0 ? SGSTPercent : 0,
          SGSTAmount: goldTotals.SGSTAmount,
          grandTotal: goldTotals.grandTotal,
          shopSettings: {
            shopName: "Jay Krishna Haribhai Soni",
            gstNumber: goldGstNumber,
            gstType: "Gold",
          },
        };
        pdfDataArray.push(goldPdfData);
      }

      if (silverItems.length > 0) {
        const silverPdfData = {
          invoiceNumber: finalInvoiceNumber,
          invoiceDate,
          customer: {
            name: customerName,
            address: customerAddress,
            email: customerEmail,
            phone: customerPhone,
            huid: customerHUID,
          },
          items: silverItems.map((item, index) => ({
            productNo: `SILVER-${index + 1}`,
            description: `${item.itemType.toUpperCase()} ${item.purity} ${
              item.description
            }`.trim(),
            quantity: 1,
            weight: convertToGrams(item.weight.value, item.weight.unit),
            pricePerGram: item.ratePerGram,
            otherCharges: item.otherCharges || 0,
            amount: item.itemTotal,
          })),
          subtotal: silverTotals.subtotal,
          CGSTPercent: silverItems.length > 0 ? CGSTPercent : 0,
          CGSTAmount: silverTotals.CGSTAmount,
          SGSTPercent: silverItems.length > 0 ? SGSTPercent : 0,
          SGSTAmount: silverTotals.SGSTAmount,
          grandTotal: silverTotals.grandTotal,
          shopSettings: {
            shopName: "Measers Yogeshkumar and Brothers",
            gstNumber: silverGstNumber,
            gstType: "Silver",
          },
        };
        pdfDataArray.push(silverPdfData);
      }

      if (otherItems.length > 0) {
        const otherPdfData = {
          invoiceNumber: finalInvoiceNumber,
          invoiceDate,
          customer: {
            name: customerName,
            address: customerAddress,
            email: customerEmail,
            phone: customerPhone,
            huid: customerHUID,
          },
          items: otherItems.map((item, index) => ({
            productNo: `OTHER-${index + 1}`,
            description: `${item.itemType.toUpperCase()} ${item.purity} ${
              item.description
            }`.trim(),
            quantity: 1,
            weight: convertToGrams(item.weight.value, item.weight.unit),
            pricePerGram: item.ratePerGram,
            otherCharges: item.otherCharges || 0,
            amount: item.itemTotal,
          })),
          subtotal: otherTotals.subtotal,
          CGSTPercent: 0,
          CGSTAmount: 0,
          SGSTPercent: 0,
          SGSTAmount: 0,
          grandTotal: otherTotals.subtotal,
          shopSettings: {
            shopName: shopName,
            gstNumber: "",
            gstType: "None",
          },
        };
        pdfDataArray.push(otherPdfData);
      }

      const baseUrl = window.location.origin;
      const qrCodeUrl = `${baseUrl}/api/invoices/download/${finalInvoiceNumber}?auto=1`;

      const qrCodeData = JSON.stringify({
        invoiceNumber: finalInvoiceNumber,
        date: invoiceDate,
        timestamp: new Date().toISOString(),
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          huid: customerHUID,
        },
        totals: {
          gold: goldItems.length > 0 ? goldTotals.grandTotal : 0,
          silver: silverItems.length > 0 ? silverTotals.grandTotal : 0,
          other: otherItems.length > 0 ? otherTotals.grandTotal : 0,
          total:
            (goldItems.length > 0 ? goldTotals.grandTotal : 0) +
            (silverItems.length > 0 ? silverTotals.grandTotal : 0) +
            (otherItems.length > 0 ? otherTotals.grandTotal : 0),
        },
        downloadUrl: qrCodeUrl,
        downloadUrls: pdfDataArray.map((pdfData, index) => ({
          type: pdfData.shopSettings.shopName,
          gstType: pdfData.shopSettings.gstType,
          url: `${baseUrl}/api/invoices/download/${finalInvoiceNumber}/${
            index + 1
          }?auto=1`,
        })),
        items: lineItems.map((item) => ({
          type: item.itemType,
          purity: item.purity,
          weight: item.weight,
          total: item.itemTotal,
        })),
        ratesSource: useLiveRatesEnabled ? "live" : "manual",
        gstNumbers: {
          gold: goldGstNumber,
          silver: silverGstNumber,
        },
        shopName: shopName,
      });

      const overallSubtotal = subtotal;
      const overallCGSTAmount = goldTotals.CGSTAmount + silverTotals.CGSTAmount;
      const overallSGSTAmount = goldTotals.SGSTAmount + silverTotals.SGSTAmount;
      const overallTotalGST = overallCGSTAmount + overallSGSTAmount;
      const overallGrandTotal =
        goldTotals.grandTotal +
        silverTotals.grandTotal +
        otherTotals.grandTotal;

      const ratesSource: "live" | "manual" = useLiveRatesEnabled
        ? "live"
        : "manual";

      const invoicePayload = {
        invoiceNumber: finalInvoiceNumber,
        date: invoiceDate,
        customerId: selectedCustomer || "new-customer",
        customerSnapshot: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          huid: customerHUID,
        },
        lineItems,
        totals: {
          subtotal: overallSubtotal,
          CGSTPercent:
            goldItems.length > 0 || silverItems.length > 0 ? CGSTPercent : 0,
          CGSTAmount: overallCGSTAmount,
          SGSTPercent:
            goldItems.length > 0 || silverItems.length > 0 ? SGSTPercent : 0,
          SGSTAmount: overallSGSTAmount,
          totalGST: overallTotalGST,
          grandTotal: overallGrandTotal,
        },
        paymentDetails: {
          paymentMode,
          amountPaid: 0,
          balanceDue: overallGrandTotal,
        },
        QRCodeData: qrCodeData,
        QRCodeUrl: qrCodeUrl,
        pdfData: pdfDataArray,
        ratesSource,
        gstInfo: {
          goldUsed: goldItems.length > 0,
          silverUsed: silverItems.length > 0,
          goldGstNumber: goldGstNumber,
          silverGstNumber: silverGstNumber,
        },
        downloadUrl: qrCodeUrl,
      };

      createInvoice.mutate(invoicePayload, {
        onSuccess: (data) => {
          showToast.success("Invoice created successfully!");
          setInvoiceData(pdfDataArray);
          setShowQRCode(true);

          const pdfTypes = [];
          if (goldItems.length > 0) pdfTypes.push("Gold (Jay Krishna)");
          if (silverItems.length > 0) pdfTypes.push("Silver (Yogeshkumar)");
          if (otherItems.length > 0) pdfTypes.push("Other Items");

          if (pdfTypes.length > 0) {
            showToast.success(
              `Generated ${pdfTypes.join(", ")} PDF${
                pdfTypes.length > 1 ? "s" : ""
              }`
            );

            if (pdfDataArray.length === 1) {
              const downloadLink = document.createElement("a");
              downloadLink.href = `${baseUrl}/api/invoices/download/${finalInvoiceNumber}?auto=1`;
              downloadLink.target = "_blank";
              downloadLink.click();
            }
          }

          generateInvoiceNumber();

          setCustomerName("");
          setCustomerPhone("");
          setCustomerEmail("");
          setCustomerAddress("");
          setCustomerHUID("");
          setSelectedCustomer("");
          setLineItems([
            {
              itemType: "gold",
              purity: "24K",
              description: "",
              weight: { value: 0, unit: "g" },
              ratePerGram: getRateForItem("gold", "24K"),
              labourChargeReferenceId: "",
              labourChargeType: null,
              labourChargeAmount: 0,
              makingChargesTotal: 0,
              otherCharges: 0,
              itemTotal: 0,
            },
          ]);

          setTimeout(() => {
            showToast.info(
              "Scan the QR code to download invoice on any device"
            );
          }, 1000);
        },
        onError: (error: any) => {
          console.error("Invoice creation error:", error);

          if (error.response?.data?.error?.includes("duplicate key")) {
            showToast.error(
              "Invoice number already exists. Generating new number..."
            );
            setTimeout(() => {
              generateInvoiceNumber();
            }, 1000);
          } else if (error.response?.data?.error?.includes("network")) {
            showToast.error(
              "Network error. Please check your connection and try again."
            );
          } else {
            showToast.error(
              error.response?.data?.error ||
                "Failed to create invoice. Please try again."
            );
          }
        },
      });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      showToast.error(
        error.message || "Failed to process invoice. Please try again."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <MdReceipt className="text-2xl text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create Invoice</h2>
            <p className="text-gray-600">
              Generate new invoices with live metal rates
            </p>
          </div>
        </div>

        {/* Live Rates Toggle and Status */}
        <div className="p-6 mb-6 border border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    title="Use Live Metal Rates"
                    type="checkbox"
                    checked={useLiveRatesEnabled}
                    onChange={(e) => setUseLiveRatesEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <label className="text-sm font-semibold text-gray-800 cursor-pointer select-none">
                  Live Metal Rates
                </label>
              </div>

              {useLiveRatesEnabled && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700">
                    Live Active
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {useLiveRatesEnabled && (
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`flex items-center gap-1.5 ${
                      liveRatesLoading
                        ? "text-yellow-600"
                        : liveRates && liveRates.length > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        liveRatesLoading
                          ? "bg-yellow-500 animate-pulse"
                          : liveRates && liveRates.length > 0
                          ? "bg-green-500 animate-pulse"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="font-medium">
                      {liveRatesLoading
                        ? "Updating rates..."
                        : liveRates && liveRates.length > 0
                        ? "Rates synced"
                        : "No rates available"}
                    </span>
                  </div>

                  {liveRates && liveRates.length > 0 && !liveRatesLoading && (
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const lastUpdated = new Date(liveRates[0].lastUpdated);
                        const minutesAgo = Math.floor(
                          (new Date().getTime() - lastUpdated.getTime()) / 60000
                        );
                        return `Updated ${minutesAgo} min ago`;
                      })()}
                    </span>
                  )}
                </div>
              )}

              {useLiveRatesEnabled && (
                <button
                  onClick={handleRefreshRates}
                  disabled={liveRatesLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 bg-white border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
                >
                  <MdRefresh
                    className={`text-lg transition-transform ${
                      liveRatesLoading ? "animate-spin" : "hover:rotate-180"
                    }`}
                  />
                  {liveRatesLoading ? "Refreshing..." : "Refresh"}
                </button>
              )}
            </div>
          </div>

          {useLiveRatesEnabled && renderLiveRatesIndicator()}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="min-w-0 space-y-6 lg:col-span-2">
            {/* Customer & Date Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Customer Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="invoice-number"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Invoice Number *
                  </label>
                  <input
                    id="invoice-number"
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="INV-1"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="invoice-date"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Invoice Date
                  </label>
                  <DateDropdown
                    value={invoiceDate}
                    onChange={(value) => setInvoiceDate(value)}
                    placeholder="Select invoice date"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="customer-select"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Select Customer
                  </label>
                  <CustomDropdown
                    options={[
                      { value: "", label: "Add New Customer" },
                      ...(customers?.map((c: Customer) => ({
                        value: c._id,
                        label: `${c.name} - ${c.phone}`,
                      })) || []),
                    ]}
                    value={selectedCustomer}
                    onChange={handleCustomerSelect}
                    placeholder="Choose a customer or add new..."
                    aria-label="Select customer"
                  />
                </div>
              </div>

              {/* Customer Information Form */}
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Customer Name *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-phone"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-huid"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    HUID (Hallmark Unique ID)
                  </label>
                  <input
                    id="customer-huid"
                    type="text"
                    value={customerHUID}
                    onChange={(e) => setCustomerHUID(e.target.value)}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter HUID number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="customer-address"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    id="customer-address"
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </motion.div>

            {/* Line Items Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={addLineItem}
                  className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-0"
                >
                  <MdAdd className="text-lg" />
                  Add Item
                </motion.button>
              </div>

              <AnimatePresence>
                {lineItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 mb-4 transition-colors border border-gray-200 rounded-lg bg-gray-50 hover:bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700">
                        Item : {index + 1}
                      </h4>
                      {lineItems.length > 1 && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeLineItem(index)}
                          className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50 focus:outline-none focus:ring-0"
                          title="Remove item"
                        >
                          <MdDelete className="text-lg" />
                        </motion.button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {/* Item Type */}
                      <div className="min-w-0">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Item Type
                        </label>
                        <CustomDropdown
                          options={itemTypeOptions}
                          value={item.itemType}
                          onChange={(value) =>
                            handleLineItemChange(index, "itemType", value)
                          }
                          aria-label="Select item type"
                        />
                      </div>

                      {/* Purity */}
                      <div className="min-w-0">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Purity
                        </label>
                        <CustomDropdown
                          options={
                            purityOptions[
                              item.itemType as keyof typeof purityOptions
                            ] || purityOptions.other
                          }
                          value={item.purity}
                          onChange={(value) =>
                            handleLineItemChange(index, "purity", value)
                          }
                          aria-label="Select purity"
                        />
                      </div>

                      {/* Labour Charge */}
                      <div className="min-w-0">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Labour Charge
                        </label>
                        <CustomDropdown
                          options={[
                            { value: "", label: "No LC" },
                            ...(labourCharges
                              ?.filter((lc) => lc.isActive)
                              .map((lc: LabourCharge) => ({
                                value: lc._id,
                                label: `${lc.name} (${
                                  lc.chargeType === "perGram"
                                    ? "per gram"
                                    : "fixed"
                                })`,
                              })) || []),
                          ]}
                          value={item.labourChargeReferenceId || ""}
                          onChange={(value) =>
                            handleLineItemChange(
                              index,
                              "labourChargeReferenceId",
                              value
                            )
                          }
                          aria-label="Select labour charge"
                        />
                      </div>

                      {/* Weight */}
                      <div className="min-w-0">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Weight
                        </label>
                        <div className="flex w-full gap-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.weight.value}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "weightValue",
                                e.target.value
                              )
                            }
                            className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            aria-label="Enter weight value"
                          />
                          <CustomDropdown
                            options={weightUnitOptions}
                            value={item.weight.unit}
                            onChange={(value) =>
                              handleLineItemChange(index, "weightUnit", value)
                            }
                            className="w-18"
                            aria-label="Select weight unit"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 gap-4 mt-3 md:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Item description"
                          aria-label="Enter item description"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Other Charges
                        </label>
                        <div className="relative">
                          <span className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.otherCharges || 0}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "otherCharges",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            aria-label="Enter other charges"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Item Summary */}
                    <div className="p-3 mt-3 bg-white border rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-gray-600">Rate/Gram:</span>
                          <span className="ml-1 font-medium">
                            ₹{item.ratePerGram.toFixed(2)}
                          </span>
                          {useLiveRatesEnabled && (
                            <span className="ml-1 text-xs text-green-600">
                              (Live)
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-600">Making Charges:</span>
                          <span className="ml-1 font-medium">
                            ₹{item.makingChargesTotal.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Other Charges:</span>
                          <span className="ml-1 font-medium">
                            ₹{(item.otherCharges || 0).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Item Total:</span>
                          <span className="ml-1 font-medium text-green-600">
                            ₹{item.itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Payment Details Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Payment Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    CGST Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={CGSTPercent}
                      onChange={(e) => setCGSTPercent(Number(e.target.value))}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Enter CGST percentage"
                    />
                    <span className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    SGST Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={SGSTPercent}
                      onChange={(e) => setSGSTPercent(Number(e.target.value))}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Enter SGST percentage"
                    />
                    <span className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Payment Mode
                  </label>
                  <CustomDropdown
                    options={paymentModeOptions}
                    value={paymentMode}
                    onChange={setPaymentMode}
                    aria-label="Select payment mode"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="min-w-0 space-y-6">
            {/* Invoice Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky p-6 bg-white border border-gray-100 shadow-sm rounded-xl top-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MdCalculate className="text-xl text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Invoice Summary
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">CGST ({CGSTPercent}%):</span>
                  <span className="font-medium">₹{CGSTAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">SGST ({SGSTPercent}%):</span>
                  <span className="font-medium">₹{SGSTAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total GST:</span>
                  <span className="font-medium">₹{totalGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-300">
                  <span className="text-lg font-semibold text-gray-800">
                    Grand Total:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={
                  createInvoice.isPending ||
                  generatingInvoiceNumber ||
                  !customerName.trim() ||
                  !customerPhone.trim()
                }
                className="flex items-center justify-center w-full gap-2 py-3 mt-6 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdCurrencyRupee className="text-xl" />
                {generatingInvoiceNumber
                  ? "Generating Invoice Number..."
                  : createInvoice.isPending
                  ? "Creating Invoice..."
                  : "Finalize Invoice"}
              </motion.button>

              {createInvoice.isError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 mt-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50"
                >
                  Failed to create invoice. Please try again.
                </motion.div>
              )}
            </motion.div>

            {/* QR Code & Download Section */}
            {invoiceData && showQRCode && invoiceData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MdQrCode className="text-xl text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Invoice QR Code
                  </h3>
                </div>

                <div className="flex justify-center mb-4">
                  <InvoiceQRCode
                    data={`${window.location.origin}/api/invoices/download/${invoiceNumber}?auto=1`}
                    size={200}
                    invoiceNumber={invoiceNumber}
                  />
                </div>

                <div className="space-y-2">
                  {invoiceData.map((pdfData: PdfData, index: number) => (
                    <PDFDownloadLink
                      key={index}
                      document={<SingleInvoicePDF data={pdfData} />}
                      fileName={`${pdfData.invoiceNumber}_${
                        pdfData.customer.name
                      }_${pdfData.shopSettings.shopName.replace(
                        /\s+/g,
                        "_"
                      )}.pdf`}
                      className="flex items-center justify-center w-full gap-2 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      {({ loading }) => (
                        <>
                          <MdDownload className="text-lg" />
                          {loading
                            ? `Preparing ${pdfData.shopSettings.shopName}...`
                            : `Download ${pdfData.invoiceNumber}`}
                        </>
                      )}
                    </PDFDownloadLink>
                  ))}

                  <button
                    onClick={() => setShowQRCode(false)}
                    className="w-full py-2 text-sm text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0"
                  >
                    Hide QR Code
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
