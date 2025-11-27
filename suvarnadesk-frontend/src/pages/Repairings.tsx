import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MdAdd, MdDownload, MdDelete } from "react-icons/md";
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
    companyName: "SuvarnaDesk",
    companyAddress: "Anand, Gujarat, India",
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

  const generatePDF = () => {
    if (!formData.receiptNumber) {
      showToast.error("Please enter a receipt number");
      return;
    }
    if (formData.items.length === 0) {
      showToast.error("Please add at least one service item");
      return;
    }
    if (!formData.customerName || !formData.customerAddress) {
      showToast.error("Please fill customer details");
      return;
    }
    if (!formData.salespersonName) {
      showToast.error("Please fill salesperson name");
      return;
    }

    const element = pdfRef.current;
    if (!element) {
      showToast.error("Something went wrong. Please try again.");
      return;
    }

    showToast.loading("Generating PDF, please wait...");

    const opt = {
      // smaller outer margin so everything fits comfortably on a single page
      margin: [5, 5, 5, 5] as [number, number, number, number],
      filename: `Receipt-${formData.receiptNumber}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2, // crisp text
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        orientation: "portrait" as const,
        unit: "mm" as const,
        format: "a4" as const,
      },
      pagebreak: {
        mode: ["avoid-all" as const], // try to keep everything on one page
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date & Time *
                </label>
                <input
                  title="Date and Time"
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
                  title="Date and Time"
                  type="number"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tax: Number(e.target.value),
                    }))
                  }
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
                    rows={3}
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
                    title="Date and Time"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Company Address *
                  </label>
                  <textarea
                    title="Date and Time"
                    value={formData.companyAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyAddress: e.target.value,
                      }))
                    }
                    rows={3}
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
                  placeholder="e.g., AC Repair"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  title="Date and Time"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  min="1"
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
                            title="Date and Time"
                            onClick={() => handleRemoveItem(index)}
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

          {/* Generate PDF Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generatePDF}
            className="flex items-center justify-center w-full gap-2 px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <MdDownload className="text-lg" />
            Generate PDF Receipt
          </motion.button>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Content */}
      <div className="hidden">
        <div
          ref={pdfRef}
          className="bg-white"
          style={{
            width: "190mm", // slightly narrower than full A4 to avoid clipping
            padding: "8mm 10mm",
            fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
            fontSize: "8pt",
          }}
        >
          <div
            className="w-full mx-auto leading-tight"
            style={{ lineHeight: 1.2 }}
          >
            {/* Header Section - Compact & centered label */}
            <div className="flex items-start justify-between pb-2 mb-3 border-b border-gray-300">
              <div className="flex-1">
                <h1 className="mb-1 text-base font-bold text-gray-800">
                  {formData.companyName}
                </h1>
                <p className="text-gray-600 text-[7pt] whitespace-pre-line leading-tight">
                  {formData.companyAddress}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center px-3 py-1 mb-2 text-white rounded bg-emerald-600">
                  <h2 className="font-bold text-[9pt] tracking-wide">
                    AC REPAIR RECEIPT
                  </h2>
                </div>
                <div className="space-y-0.5 text-[7pt]">
                  <div>
                    <span className="font-semibold">Receipt #:</span>{" "}
                    {formData.receiptNumber || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span>{" "}
                    {formData.receiptDateTime
                      ? new Date(formData.receiptDateTime).toLocaleDateString()
                      : "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Payment:</span>{" "}
                    <span className="capitalize">
                      {formData.paymentMethod || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Company Info - More Compact */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border border-gray-200 rounded">
                <div className="flex items-center justify-center px-2 py-1 text-white bg-emerald-600">
                  <div className="font-semibold text-[7pt] tracking-wide">
                    CUSTOMER
                  </div>
                </div>
                <div className="p-2">
                  <div className="mb-1 text-[8pt] font-semibold text-gray-800">
                    {formData.customerName || "[Customer Name]"}
                  </div>
                  <div className="text-[7pt] text-gray-700 whitespace-pre-line leading-tight">
                    {formData.customerAddress || "[Customer Address]"}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded">
                <div className="flex items-center justify-center px-2 py-1 text-white bg-emerald-600">
                  <div className="font-semibold text-[7pt] tracking-wide">
                    COMPANY
                  </div>
                </div>
                <div className="p-2">
                  <div className="mb-1 text-[8pt] font-semibold text-gray-800">
                    {formData.companyName}
                  </div>
                  <div className="text-[7pt] text-gray-700 whitespace-pre-line leading-tight">
                    {formData.companyAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Services Table - Compact */}
            <table className="w-full mb-3 border border-gray-300 text-[7pt]">
              <thead>
                <tr className="text-white bg-emerald-600">
                  <th className="px-2 py-1 text-left font-semibold border-r border-emerald-500 w-[50%]">
                    SERVICE DESCRIPTION
                  </th>
                  <th className="px-2 py-1 text-center font-semibold border-r border-emerald-500 w-[10%]">
                    QTY
                  </th>
                  <th className="px-2 py-1 text-right font-semibold border-r border-emerald-500 w-[20%]">
                    UNIT PRICE
                  </th>
                  <th className="px-2 py-1 text-right font-semibold w-[20%]">
                    AMOUNT (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.length > 0 ? (
                  formData.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="px-2 py-1 text-gray-800 align-top border-r border-gray-200">
                        {item.description}
                      </td>
                      <td className="px-2 py-1 text-center text-gray-800 border-r border-gray-200">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-1 text-right text-gray-800 border-r border-gray-200">
                        ₹{item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-2 py-1 font-medium text-right text-gray-800">
                        ₹{(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-2 py-3 italic text-center text-gray-400"
                      colSpan={4}
                    >
                      No services added
                    </td>
                  </tr>
                )}

                {/* fewer filler rows to keep layout on single page */}
                {Array.from({
                  length: Math.max(3 - formData.items.length, 0),
                }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-t border-gray-100">
                    <td className="px-2 py-0.5 border-r border-gray-200">
                      &nbsp;
                    </td>
                    <td className="px-2 py-0.5 border-r border-gray-200"></td>
                    <td className="px-2 py-0.5 border-r border-gray-200"></td>
                    <td className="px-2 py-0.5"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section - Compact */}
            <div className="flex justify-end mb-3">
              <div className="overflow-hidden border border-gray-300 rounded w-52">
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-300 bg-gray-50">
                  <span className="font-semibold text-gray-700 text-[7pt]">
                    Subtotal:
                  </span>
                  <span className="text-gray-800 text-[7pt]">
                    ₹{calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-300">
                  <span className="font-semibold text-gray-700 text-[7pt]">
                    Tax ({formData.tax}%):
                  </span>
                  <span className="text-gray-800 text-[7pt]">
                    ₹{calculateTax().toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50">
                  <span className="font-bold text-gray-800 text-[8pt]">
                    TOTAL:
                  </span>
                  <span className="font-bold text-emerald-600 text-[8pt]">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Salesperson Info */}
            <div className="p-2 mb-2 border border-gray-300 rounded bg-gray-50">
              <div className="mb-1 text-[7pt] font-semibold text-gray-700">
                Salesperson:
              </div>
              <div className="text-[8pt] text-gray-800">
                {formData.salespersonName || "[Salesperson Name]"}
              </div>
            </div>

            {/* Notes Section - Compact */}
            <div className="p-2 mb-2 border border-gray-300 rounded bg-gray-50">
              <div className="mb-1 text-[7pt] font-semibold text-gray-700">
                Notes:
              </div>
              <div className="text-[7pt] italic text-gray-600">
                Thank you for choosing our AC repair services. Warranty as per
                company policy.
              </div>
            </div>

            {/* Signatures Section - Compact */}
            <div className="flex items-end justify-between pt-2 border-t border-gray-300">
              <div className="flex-1 text-center">
                <div className="mb-1 text-[7pt] font-semibold text-gray-700">
                  Customer Signature
                </div>
                <div className="w-32 h-6 mx-auto border-b border-gray-400"></div>
              </div>

              <div className="flex-1 text-center">
                <div className="mb-1 text-[7pt] font-semibold text-emerald-600">
                  Authorized Signature
                </div>
                <div className="w-32 h-6 mx-auto border-b border-gray-400"></div>
              </div>
            </div>

            {/* Footer - Compact */}
            <div className="pt-2 mt-3 text-center border-t border-gray-300">
              <div className="text-[6.5pt] text-gray-500">
                <div className="mb-0.5 font-semibold">
                  {formData.companyName}
                </div>
                <div>Thank you for your business!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
