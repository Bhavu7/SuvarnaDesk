import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdDelete,
  MdReceipt,
  MdQrCode,
  MdAttachMoney,
  MdCalculate,
} from "react-icons/md";
import { useCustomers, Customer } from "../hooks/useCustomers";
import { useLabourCharges, LabourCharge } from "../hooks/useLabourCharges";
import { useMetalRates, MetalRate } from "../hooks/useMetalRates";
import { useCreateInvoice, LineItem } from "../hooks/useBilling";
import CustomDropdown from "../components/CustomDropdown";
import InvoiceQRCode from "../components/InvoiceQRCode";
import { showToast } from "../components/CustomToast";

export default function Billing() {
  const { data: customers } = useCustomers();
  const { data: labourCharges } = useLabourCharges();
  const { data: metalRates } = useMetalRates();
  const createInvoice = useCreateInvoice();

  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
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
      itemTotal: 0,
    },
  ]);
  const [GSTPercent, setGSTPercent] = useState<number>(3.0);
  const [paymentMode, setPaymentMode] = useState<string>("cash");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);

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

  const subtotal: number = lineItems.reduce(
    (acc, item) => acc + item.itemTotal,
    0
  );
  const GSTAmount = (subtotal * GSTPercent) / 100;
  const grandTotal = subtotal + GSTAmount;
  const balanceDue = grandTotal - amountPaid;

  const handleLineItemChange = (
    index: number,
    field:
      | keyof LineItem
      | "weightValue"
      | "weightUnit"
      | "labourChargeReferenceId",
    value: string | number | null
  ) => {
    const updatedItems = [...lineItems];
    const item = updatedItems[index];

    if (field === "weightValue" || field === "weightUnit") {
      if (field === "weightValue") item.weight.value = Number(value) || 0;
      else if (typeof value === "string") item.weight.unit = value;

      const rateEntry = metalRates?.find(
        (rate: MetalRate) =>
          rate.metalType === item.itemType &&
          rate.purity === item.purity &&
          rate.isActive
      );
      if (rateEntry) item.ratePerGram = rateEntry.ratePerGram;

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
      item.itemTotal = metalPrice + labourChargeAmount;
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
      item.itemTotal = weightInGrams * item.ratePerGram + labourChargeAmount;
    }

    if (
      !["weightValue", "weightUnit", "labourChargeReferenceId"].includes(field)
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
        ratePerGram: 0,
        labourChargeReferenceId: "",
        labourChargeType: null,
        labourChargeAmount: 0,
        makingChargesTotal: 0,
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

  const handleSubmit = () => {
    if (!selectedCustomer) {
      showToast.error("Please select a customer");
      return;
    }

    if (lineItems.some((item) => item.weight.value === 0)) {
      showToast.error("Please enter weight for all items");
      return;
    }

    if (createInvoice.isPending) return;

    createInvoice.mutate(
      {
        invoiceNumber: `INV-${Date.now()}`,
        date: invoiceDate,
        customerId: selectedCustomer,
        customerSnapshot:
          customers?.find((c: Customer) => c._id === selectedCustomer) || {},
        lineItems,
        totals: { subtotal, GSTPercent, GSTAmount, grandTotal },
        paymentDetails: { paymentMode, amountPaid, balanceDue },
        QRCodeData: `Invoice INV-${Date.now()}, Total: ₹${grandTotal.toFixed(
          2
        )}`,
      },
      {
        onSuccess: () => {
          showToast.success("Invoice created successfully!");
          setShowQRCode(true);
        },
        onError: (error: any) => {
          showToast.error(
            error.response?.data?.error || "Failed to create invoice"
          );
        },
      }
    );
  };

  const selectedCustomerData = customers?.find(
    (c: Customer) => c._id === selectedCustomer
  );

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
              Generate new invoices for your customers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="space-y-6 lg:col-span-2">
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
                    htmlFor="invoice-date"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Invoice Date
                  </label>
                  <input
                    id="invoice-date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-select"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Select Customer
                  </label>
                  <CustomDropdown
                    options={
                      customers?.map((c: Customer) => ({
                        value: c._id,
                        label: `${c.name} - ${c.phone}`,
                      })) || []
                    }
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    placeholder="Choose a customer..."
                    aria-label="Select customer"
                  />
                </div>
              </div>

              {selectedCustomerData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 mt-4 border border-blue-200 rounded-lg bg-blue-50"
                >
                  <h4 className="mb-2 font-medium text-blue-800">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">
                        {selectedCustomerData.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">
                        {selectedCustomerData.phone}
                      </span>
                    </div>
                    {selectedCustomerData.address && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Address:</span>
                        <span className="ml-2 font-medium">
                          {selectedCustomerData.address}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addLineItem}
                  className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
                        Item #{index + 1}
                      </h4>
                      {lineItems.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeLineItem(index)}
                          className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
                          title="Remove item"
                        >
                          <MdDelete className="text-lg" />
                        </motion.button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {/* Item Type */}
                      <div>
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
                      <div>
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

                      {/* Weight */}
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Weight
                        </label>
                        <div className="flex gap-2">
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            aria-label="Enter weight value"
                          />
                          <CustomDropdown
                            options={weightUnitOptions}
                            value={item.weight.unit}
                            onChange={(value) =>
                              handleLineItemChange(index, "weightUnit", value)
                            }
                            className="w-24"
                            aria-label="Select weight unit"
                          />
                        </div>
                      </div>

                      {/* Labour Charge */}
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Labour Charge
                        </label>
                        <CustomDropdown
                          options={[
                            { value: "", label: "No Labour Charge" },
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
                    </div>

                    {/* Item Summary */}
                    <div className="p-3 mt-3 bg-white border rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-gray-600">Rate/Gram:</span>
                          <span className="ml-1 font-medium">
                            ₹{item.ratePerGram.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Making Charges:</span>
                          <span className="ml-1 font-medium">
                            ₹{item.makingChargesTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="md:col-span-2">
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
                    GST Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={GSTPercent}
                      onChange={(e) => setGSTPercent(Number(e.target.value))}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Enter GST percentage"
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

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Amount Paid
                  </label>
                  <div className="relative">
                    <span className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      aria-label="Enter amount paid"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
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
                  <span className="text-gray-600">GST ({GSTPercent}%):</span>
                  <span className="font-medium">₹{GSTAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">₹{amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-300">
                  <span className="text-lg font-semibold text-gray-800">
                    Grand Total:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Balance Due:</span>
                  <span
                    className={`font-medium ${
                      balanceDue > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ₹{balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={createInvoice.isPending || !selectedCustomer}
                className="flex items-center justify-center w-full gap-2 py-3 mt-6 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdAttachMoney className="text-xl" />
                {createInvoice.isPending
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

            {/* QR Code Section */}
            {createInvoice.data && showQRCode && (
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
                <div className="flex justify-center">
                  <InvoiceQRCode data={createInvoice.data.QRCodeData || ""} />
                </div>
                <p className="mt-3 text-sm text-center text-gray-600">
                  Scan to view invoice details
                </p>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="w-full py-2 mt-3 text-sm text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hide QR Code
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
