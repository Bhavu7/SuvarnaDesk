import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd, MdDownload, MdDelete, MdEdit } from "react-icons/md";
import html2pdf from "html2pdf.js";
import { showToast } from "../components/CustomToast";

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
    if (!formData.receiptNumber || formData.items.length === 0) {
      showToast.error("Please fill receipt number and add items");
      return;
    }

    const element = pdfRef.current;
    if (!element) {
      showToast.error("Something went wrong. Please try again.");
      return;
    }

    const opt = {
      margin: [5, 5, 5, 5] as [number, number, number, number],
      filename: `Receipt-${formData.receiptNumber}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        orientation: "portrait" as const,
        unit: "mm" as const,
        format: "a4" as const,
      },
    };

    (html2pdf() as any).set(opt).from(element).save();
    showToast.success("PDF generated successfully!");
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
                <select
                  title="Date and Time"
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
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

      {/* Hidden PDF Template */}
      <div className="hidden">
        <div
          ref={pdfRef}
          className="bg-white"
          style={{ width: "210mm", minHeight: "297mm", padding: "12mm" }}
        >
          <div
            className="w-full mx-auto text-[11px] leading-snug"
            style={{ fontFamily: "Roboto, 'Segoe UI', sans-serif" }}
          >
            {/* Top Logo + Title bar */}
            <div className="border border-gray-300">
              {/* Top logo row (you can replace with your real logo or text) */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                <div className="text-sm font-bold text-green-700">
                  {/* Logo placeholder */}
                  SuvarnaDesk
                </div>
                {/* Empty right side to mimic layout */}
                <div />
              </div>

              {/* Green title bar */}
              <div className="py-2 text-center bg-emerald-600">
                <span className="text-base font-semibold text-white">
                  AC Repair Receipt
                </span>
              </div>

              {/* Receipt meta row */}
              <div className="flex justify-between px-4 py-2 text-xs border-b border-gray-300 bg-gray-50">
                <div>
                  <span className="font-semibold text-gray-700">
                    Receipt Number:{" "}
                  </span>
                  <span className="text-gray-800">
                    {formData.receiptNumber || "-"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Payment Method:{" "}
                  </span>
                  <span className="text-gray-800 capitalize">
                    {formData.paymentMethod || "-"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between px-4 py-1 text-xs border-b border-gray-300">
                <div>
                  <span className="font-semibold text-gray-700">
                    Receipt Date:{" "}
                  </span>
                  <span className="text-gray-800">
                    {formData.receiptDateTime
                      ? new Date(formData.receiptDateTime).toLocaleString()
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Customer / Seller boxes */}
              <div className="grid grid-cols-2 gap-0 px-4 pt-3 pb-2">
                {/* Customer */}
                <div className="border border-gray-300">
                  <div className="px-2 py-1 text-xs font-semibold text-white bg-emerald-600">
                    Customer
                  </div>
                  <div className="px-2 py-2 text-xs min-h-[60px]">
                    <div className="font-semibold text-gray-800">
                      {formData.customerName || "[Customer Name]"}
                    </div>
                    <div className="mt-1 text-gray-700 whitespace-pre-line">
                      {formData.customerAddress ||
                        "[Customer Address Line 1]\n[Line 2]\n[Line 3]"}
                    </div>
                  </div>
                </div>

                {/* Seller */}
                <div className="border border-l-0 border-gray-300">
                  <div className="px-2 py-1 text-xs font-semibold text-white bg-emerald-600">
                    Seller
                  </div>
                  <div className="px-2 py-2 text-xs min-h-[60px]">
                    <div className="font-semibold text-gray-800">
                      {formData.companyName || "[Company Name]"}
                    </div>
                    <div className="mt-1 text-gray-700 whitespace-pre-line">
                      {formData.companyAddress ||
                        "[Company Address Line 1]\n[Line 2]\n[Line 3]"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description table header */}
              <table className="w-full mt-3 text-xs border-t border-b border-gray-300">
                <thead>
                  <tr className="text-white bg-emerald-600">
                    <th className="px-2 py-1 text-left w-[45%]">DESCRIPTION</th>
                    <th className="px-2 py-1 text-center w-[15%]">QUANTITY</th>
                    <th className="px-2 py-1 text-right w-[15%]">UNIT PRICE</th>
                    <th className="px-2 py-1 text-right w-[15%]">SUBTOTAL</th>
                    <th className="px-2 py-1 text-right w-[10%]">TAX</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length > 0 ? (
                    formData.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-2 py-1 text-gray-800 align-top">
                          {item.description}
                        </td>
                        <td className="px-2 py-1 text-center text-gray-800">
                          {item.quantity}
                        </td>
                        <td className="px-2 py-1 text-right text-gray-800">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-2 py-1 text-right text-gray-800">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 text-right text-gray-800">
                          {/* per‑row tax, matching template idea */}₹
                          {(
                            (item.quantity * item.unitPrice * formData.tax) /
                            100
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-2 py-10 text-center text-gray-400"
                        colSpan={5}
                      >
                        No services added
                      </td>
                    </tr>
                  )}

                  {/* Extra blank lines to mimic lined area */}
                  {Array.from({
                    length: Math.max(6 - formData.items.length, 0),
                  }).map((_, i) => (
                    <tr key={`blank-${i}`} className="border-t border-gray-100">
                      <td className="px-2 py-2">&nbsp;</td>
                      <td />
                      <td />
                      <td />
                      <td />
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Notes + totals row */}
              <div className="flex text-xs border-t border-gray-300">
                <div className="flex-1 px-2 py-6 align-top border-r border-gray-300">
                  <span className="font-semibold text-gray-700">[Notes]</span>
                </div>
                <div className="w-64">
                  <div className="flex justify-between px-3 py-1 border-b border-gray-200">
                    <span className="text-gray-700">SUBTOTAL</span>
                    <span className="text-gray-800">
                      ₹{calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between px-3 py-1 border-b border-gray-200">
                    <span className="text-gray-700">
                      TAX ({formData.tax || 0}%)
                    </span>
                    <span className="text-gray-800">
                      ₹{calculateTax().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between px-3 py-1 font-semibold bg-gray-50">
                    <span className="text-gray-800">TOTAL</span>
                    <span className="text-emerald-600">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature row */}
              <div className="flex justify-between px-12 pt-10 pb-6 text-xs">
                <div className="flex-1 text-center">
                  <div className="pt-1 border-t border-emerald-600" />
                  <span className="block mt-1 text-emerald-700">
                    Salesperson
                  </span>
                </div>
                <div className="flex-1 text-center">
                  <div className="pt-1 border-t border-emerald-600" />
                  <span className="block mt-1 text-emerald-700">Signature</span>
                </div>
              </div>

              {/* Footer Thank you */}
              <div className="pb-6 text-xs text-center text-gray-700">
                Thank you for the payment!
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
