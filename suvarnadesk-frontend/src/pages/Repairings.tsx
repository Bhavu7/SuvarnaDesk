import { useState } from "react";
import { motion } from "framer-motion";
import {
  MdAdd,
  MdDownload,
  MdDelete,
  // MdReceipt,
  // MdPhone,
  // MdEmail,
} from "react-icons/md";
import { pdf } from "@react-pdf/renderer";
import { showToast } from "../components/CustomToast";
import CustomDropdown from "../components/CustomDropdown";
import ReceiptPDF from "../components/ReceiptPDF";
import DateTimeDropdown from "../components/DateTimeDropdown";

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

  const generatePDF = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => showToast.error(error));
      return;
    }

    showToast.loading("Generating PDF, please wait...");

    try {
      const blob = await pdf(<ReceiptPDF data={formData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.companyName.replace(/\s+/g, "_")}_Receipt_${
        formData.receiptNumber
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      showToast.error("Failed to generate PDF. Please try again.");
    }
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
                    className="px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 whitespace-nowrap focus:outline-none focus:ring-0"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date & Time *
                </label>
                <DateTimeDropdown
                  value={formData.receiptDateTime}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      receiptDateTime: value,
                    }))
                  }
                  placeholder="Select receipt date and time"
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
                  className="w-full px-4 py-3 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-0"
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
              className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 focus:outline-none focus:ring-0 hover:from-green-700 hover:to-emerald-700"
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
    </motion.div>
  );
}
