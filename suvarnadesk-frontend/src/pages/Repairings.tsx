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
    const opt = {
      margin: 5,
      filename: `Receipt-${formData.receiptNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opt).from(element).save();
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
        <div ref={pdfRef} className="p-8 bg-white" style={{ width: "210mm" }}>
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="pb-4 mb-6 text-center border-b-2 border-gray-300">
              <h1 className="text-3xl font-bold text-blue-600">
                {formData.companyName}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {formData.companyAddress}
              </p>
              <h2 className="mt-4 text-xl font-semibold">AC REPAIR RECEIPT</h2>
            </div>

            {/* Receipt Info */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Receipt Number:</p>
                <p className="text-gray-900">{formData.receiptNumber}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Date & Time:</p>
                <p className="text-gray-900">
                  {new Date(formData.receiptDateTime).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Customer & Company */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div className="p-4 border border-gray-300 rounded">
                <p className="mb-2 font-semibold text-gray-700">Customer:</p>
                <p className="font-semibold">{formData.customerName}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {formData.customerAddress}
                </p>
              </div>
              <div className="p-4 border border-gray-300 rounded">
                <p className="mb-2 font-semibold text-gray-700">
                  Payment Method:
                </p>
                <p className="font-semibold capitalize">
                  {formData.paymentMethod}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-6 text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200 border border-gray-300">
                  <th className="p-2 text-left border border-gray-300">
                    Description
                  </th>
                  <th className="p-2 text-center border border-gray-300">
                    Qty
                  </th>
                  <th className="p-2 text-right border border-gray-300">
                    Unit Price
                  </th>
                  <th className="p-2 text-right border border-gray-300">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="p-2 border border-gray-300">
                      {item.description}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {item.quantity}
                    </td>
                    <td className="p-2 text-right border border-gray-300">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-2 font-semibold text-right border border-gray-300">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8 text-sm">
              <div className="w-64">
                <div className="flex justify-between p-2 border-b border-gray-300">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-300">
                  <span>Tax ({formData.tax}%):</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 text-lg font-bold bg-gray-100">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="grid grid-cols-2 gap-20 text-sm text-center">
              <div>
                <p className="pt-2 mt-12 border-t border-gray-300">
                  Salesperson: {formData.salespersonName}
                </p>
                <p>Signature</p>
              </div>
              <div>
                <p className="text-gray-600">Customer Signature</p>
              </div>
            </div>

            {/* Thank You */}
            <div className="pt-6 mt-8 text-center border-t border-gray-300">
              <p className="font-semibold text-gray-700">
                Thank You For Your Payment!
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Please keep this receipt for your records
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
