import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MdAdd,
  MdDownload,
  MdDelete,
  MdReceipt,
  MdPhone,
  MdEmail,
} from "react-icons/md";
import html2pdf from "html2pdf.js";
import { showToast } from "../components/CustomToast";
import CustomDropdown from "../components/CustomDropdown";

interface RepairItem {
  description: string;
  quantity: number;
  unitPrice: number;
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
}

export default function Repairings() {
  const [formData, setFormData] = useState<RepairingReceipt>({
    receiptNumber: "",
    receiptDateTime: new Date().toISOString().slice(0, 16),
    paymentMethod: "cash",
    customerName: "",
    customerAddress: "",
    companyName: "SuvarnaDesk AC Services",
    companyAddress: "123 Tech Park, Anand, Gujarat 388001",
    items: [],
    salespersonName: "",
    tax: 18,
  });

  const [currentItem, setCurrentItem] = useState<RepairItem>({
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleAddItem = () => {
    if (!currentItem.description || currentItem.unitPrice <= 0) {
      showToast.error("Please fill all item fields");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...currentItem }],
    }));
    setCurrentItem({ description: "", quantity: 1, unitPrice: 0 });
    showToast.success("Item added");
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.receiptNumber.trim())
      errors.push("Receipt number is required");
    if (!formData.customerName.trim()) errors.push("Customer name is required");
    if (!formData.customerAddress.trim())
      errors.push("Customer address is required");
    if (!formData.salespersonName.trim())
      errors.push("Salesperson name is required");
    if (formData.items.length === 0)
      errors.push("At least one service item is required");
    if (formData.tax < 0 || formData.tax > 100)
      errors.push("Tax rate must be between 0-100%");

    return errors;
  };

  const generateReceiptNumber = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `RCP-${timestamp}-${random}`;
  };

  const resetForm = () => {
    setFormData({
      receiptNumber: "",
      receiptDateTime: new Date().toISOString().slice(0, 16),
      paymentMethod: "cash",
      customerName: "",
      customerAddress: "",
      companyName: "SuvarnaDesk AC Services",
      companyAddress: "123 Tech Park, Anand, Gujarat 388001",
      items: [],
      salespersonName: "",
      tax: 18,
    });
    showToast.success("Form reset successfully");
  };

  const generatePDF = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => showToast.error(error));
      return;
    }

    const element = pdfRef.current;
    if (!element) {
      showToast.error("Something went wrong. Please try again.");
      return;
    }

    showToast.loading("Generating PDF, please wait...");

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${formData.companyName.replace(/\s+/g, "_")}_Receipt_${
        formData.receiptNumber
      }.pdf`,
      image: { type: "jpeg" as const, quality: 1 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
        windowWidth: 794,
      },
      jsPDF: {
        orientation: "portrait" as const,
        unit: "mm" as const,
        format: "a4" as const,
        compress: true,
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        showToast.success("PDF downloaded successfully!");
      })
      .catch((error: any) => {
        console.error("PDF generation error:", error);
        showToast.error("Failed to generate PDF. Please try again.");
      });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            AC Repair Receipt
          </h2>
          <p className="text-gray-600">Create and manage repair receipts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetForm}
          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
        >
          Reset Form
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Receipt Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Receipt Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Receipt Number *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiptNumber: e.target.value,
                      }))
                    }
                    placeholder="e.g., RCP-001"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        receiptNumber: generateReceiptNumber(),
                      }))
                    }
                    className="px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date & Time *
                </label>
                <input
                  title="Receipt Date and Time"
                  type="datetime-local"
                  value={formData.receiptDateTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      receiptDateTime: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Payment Method *
                </label>
                <CustomDropdown
                  options={[
                    { value: "cash", label: "Cash" },
                    { value: "card", label: "Card" },
                    { value: "cheque", label: "Cheque" },
                    { value: "upi", label: "UPI" },
                    { value: "bank_transfer", label: "Bank Transfer" },
                  ]}
                  value={formData.paymentMethod}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: value }))
                  }
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Tax Rate (%) *
                </label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tax: Number(e.target.value),
                    }))
                  }
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Enter tax rate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>

          {/* Customer & Company Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Customer Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Enter customer name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Customer Address *
                  </label>
                  <textarea
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerAddress: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Enter customer address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Company Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="Enter company name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Company Address *
                  </label>
                  <textarea
                    value={formData.companyAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyAddress: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Enter company address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Items Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Add Service Items
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={currentItem.description}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleAddItem();
                    }
                  }}
                  placeholder="e.g., AC Repair Service"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  min="1"
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Unit Price (₹)
                </label>
                <input
                  type="number"
                  value={currentItem.unitPrice}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      unitPrice: Number(e.target.value),
                    }))
                  }
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddItem}
                  className="w-full px-4 py-3 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <MdAdd className="inline mr-2" />
                  Add Item
                </motion.button>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-left text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-3 font-semibold text-center text-gray-700">
                        Qty
                      </th>
                      <th className="px-4 py-3 font-semibold text-right text-gray-700">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 font-semibold text-right text-gray-700">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 font-semibold text-center text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-700">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-right text-gray-900">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            aria-label={`Remove ${item.description}`}
                            title="Remove item"
                            className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Salesperson Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Salesperson Information
            </h3>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Salesperson Name *
              </label>
              <input
                type="text"
                value={formData.salespersonName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    salespersonName: e.target.value,
                  }))
                }
                placeholder="Enter salesperson name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePDF}
              className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <MdDownload className="text-lg" />
              Generate PDF Receipt
            </motion.button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="sticky p-6 border border-gray-200 top-20 bg-gray-50 rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ₹{calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({formData.tax}%):</span>
                <span className="font-semibold text-gray-900">
                  ₹{calculateTax().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
              <div className="p-3 mt-6 border border-blue-200 rounded-lg bg-blue-50">
                <p className="text-xs text-blue-700">
                  <strong>Items:</strong> {formData.items.length}
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Payment:</strong>{" "}
                  {getPaymentMethodText(formData.paymentMethod)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Template - Hidden from normal view */}
      <div className="hidden">
        <div ref={pdfRef} className="p-8 text-gray-800 bg-white pdf-template">
          {/* Header with Branding */}
          <div className="pb-4 mb-6 border-b-2 border-blue-600">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-800">
                  {formData.companyName}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {formData.companyAddress}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MdPhone className="inline" /> +91-98765-43210
                  </span>
                  <span className="flex items-center gap-1">
                    <MdEmail className="inline" /> info@suvarnadesk.com
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="px-4 py-2 text-white bg-blue-600 rounded-lg">
                  <MdReceipt className="inline mr-2 text-xl" />
                  <span className="text-lg font-bold">SERVICE RECEIPT</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Professional AC Repair Services
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="mb-2 text-sm font-bold tracking-wide text-blue-700 uppercase">
                Bill From
              </h3>
              <p className="font-semibold text-gray-800">
                {formData.companyName}
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {formData.companyAddress}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                GSTIN: 07AABCU9603R1ZM
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="mb-2 text-sm font-bold tracking-wide text-blue-700 uppercase">
                Bill To
              </h3>
              <p className="font-semibold text-gray-800">
                {formData.customerName}
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {formData.customerAddress}
              </p>
            </div>
          </div>

          {/* Receipt Meta Information */}
          <div className="grid grid-cols-3 gap-4 p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
            <div>
              <p className="text-xs font-semibold text-blue-600">RECEIPT NO.</p>
              <p className="text-sm font-bold text-gray-800">
                {formData.receiptNumber}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600">DATE & TIME</p>
              <p className="text-sm font-bold text-gray-800">
                {formatDate(formData.receiptDateTime)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600">
                PAYMENT METHOD
              </p>
              <p className="text-sm font-bold text-gray-800">
                {getPaymentMethodText(formData.paymentMethod)}
              </p>
            </div>
          </div>

          {/* Service Items Table */}
          <div className="mb-6">
            <div className="px-4 py-3 text-white bg-blue-700 rounded-t-lg">
              <h3 className="text-lg font-bold">Service Details</h3>
            </div>
            <table className="w-full overflow-hidden border border-collapse border-gray-300 rounded-b-lg">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-3 text-sm font-bold text-left text-blue-800 border border-blue-200">
                    Description
                  </th>
                  <th className="p-3 text-sm font-bold text-center text-blue-800 border border-blue-200">
                    Qty
                  </th>
                  <th className="p-3 text-sm font-bold text-right text-blue-800 border border-blue-200">
                    Unit Price
                  </th>
                  <th className="p-3 text-sm font-bold text-right text-blue-800 border border-blue-200">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 even:bg-gray-50">
                    <td className="p-3 text-gray-700 border border-gray-200">
                      {item.description}
                    </td>
                    <td className="p-3 text-center text-gray-700 border border-gray-200">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right text-gray-700 border border-gray-200">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-3 font-semibold text-right text-gray-800 border border-gray-200">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-800">
                    ₹{calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">
                    Tax ({formData.tax}%):
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₹{calculateTax().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-3 border border-blue-200 rounded-lg bg-blue-50">
                  <span className="text-lg font-bold text-blue-800">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-blue-800">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-300">
            <div>
              <h4 className="mb-3 text-sm font-bold tracking-wide text-blue-700 uppercase">
                Service Information
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong className="text-gray-700">Service Engineer:</strong>{" "}
                  {formData.salespersonName}
                </p>
                <p>
                  <strong className="text-gray-700">Warranty:</strong> 90 days
                  on service
                </p>
                <p>
                  <strong className="text-gray-700">Service Type:</strong> AC
                  Repair & Maintenance
                </p>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold tracking-wide text-blue-700 uppercase">
                Terms & Conditions
              </h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Warranty covers service labor only</li>
                <li>• Parts warranty as per manufacturer</li>
                <li>• Original receipt required for claims</li>
                <li>• Service response within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-12 text-center border-t border-gray-300">
            <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <p className="text-sm font-semibold text-blue-800">
                Thank you for choosing {formData.companyName}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                For support: support@suvarnadesk.com | ☎ +91-98765-43210 | 🌐
                www.suvarnadesk.com
              </p>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              This is a computer-generated receipt. No signature required.
            </p>
          </div>

          {/* Watermark */}
          <div className="fixed text-6xl font-bold text-blue-300 rotate-45 pointer-events-none bottom-10 right-10 opacity-10">
            PAID
          </div>
        </div>
      </div>

      {/* Add CSS for PDF template */}
      <style>{`
        .pdf-template {
          width: 794px;
          height: 1123px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.4;
        }
      `}</style>
    </motion.div>
  );
}
