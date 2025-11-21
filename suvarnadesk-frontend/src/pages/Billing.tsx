import React, { useState } from "react";
import { useCustomers } from "../hooks/useCustomers";
import { useLabourCharges } from "../hooks/useLabourCharges";
import { useMetalRates } from "../hooks/useMetalRates";
import { useCreateInvoice } from "../hooks/useBilling";
import InvoiceQRCode from "../components/InvoiceQRCode";

export default function Billing() {
  const { data: customers } = useCustomers();
  const { data: labourCharges } = useLabourCharges();
  const { data: metalRates } = useMetalRates();
  const createInvoice = useCreateInvoice();

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [lineItems, setLineItems] = useState([
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
  const [GSTPercent, setGSTPercent] = useState(3.0);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);

  // Helper: Convert weight units internally to grams
  const convertToGrams = (value: number, unit: string) => {
    switch (unit) {
      case "kg":
        return value * 1000;
      case "g":
        return value;
      case "mg":
        return value / 1000;
      case "tola":
        return value * 11.66; // approx
      default:
        return value;
    }
  };

  // Calculate totals based on line items
  const subtotal = lineItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const GSTAmount = (subtotal * GSTPercent) / 100;
  const grandTotal = subtotal + GSTAmount;
  const balanceDue = grandTotal - amountPaid;

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...lineItems];
    const item = updatedItems[index];

    if (field === "weightValue" || field === "weightUnit") {
      if (field === "weightValue") item.weight.value = parseFloat(value) || 0;
      else item.weight.unit = value;

      // Update ratePerGram auto from live rates
      const rateEntry = metalRates?.find(
        (rate) =>
          rate.metalType === item.itemType &&
          rate.purity === item.purity &&
          rate.isActive
      );
      if (rateEntry) item.ratePerGram = rateEntry.ratePerGram;

      // Calculate metal price and labour charge
      const weightInGrams = convertToGrams(item.weight.value, item.weight.unit);
      const metalPrice = weightInGrams * item.ratePerGram;

      const labourCharge = labourCharges?.find(
        (lc) => lc._id === item.labourChargeReferenceId
      );

      let labourChargeAmount = 0;
      if (labourCharge) {
        if (labourCharge.chargeType === "perGram")
          labourChargeAmount = weightInGrams * labourCharge.amount;
        else labourChargeAmount = labourCharge.amount;
      }

      item.labourChargeAmount = labourChargeAmount;
      item.makingChargesTotal = labourChargeAmount;
      item.itemTotal = metalPrice + labourChargeAmount;
    }

    if (field === "labourChargeReferenceId") {
      item.labourChargeReferenceId = value;
      // Same computation as above...
    }

    setLineItems(updatedItems);
  };

  const handleSubmit = () => {
    if (!selectedCustomer) return alert("Select customer");

    createInvoice.mutate({
      invoiceNumber: `INV-${Date.now()}`,
      date: invoiceDate,
      customerId: selectedCustomer,
      customerSnapshot:
        customers?.find((c) => c._id === selectedCustomer) || {},
      lineItems,
      totals: { subtotal, GSTPercent, GSTAmount, grandTotal },
      paymentDetails: { paymentMode, amountPaid, balanceDue },
      QRCodeData: `Invoice INV-${Date.now()}, Total: ${grandTotal.toFixed(2)}`,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>

      <label>Date: </label>
      <input
        type="date"
        value={invoiceDate}
        onChange={(e) => setInvoiceDate(e.target.value)}
        className="border rounded p-1 mb-4"
      />

      <label>Customer:</label>
      <select
        value={selectedCustomer}
        onChange={(e) => setSelectedCustomer(e.target.value)}
        className="border rounded p-1 mb-4"
      >
        <option value="">Select Customer</option>
        {customers?.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} - {c.phone}
          </option>
        ))}
      </select>

      <hr className="my-4" />

      {lineItems.map((item, i) => (
        <div key={i} className="border p-4 mb-3 rounded space-y-2 bg-white">
          <div>
            <label>Item Type:</label>
            <select
              value={item.itemType}
              onChange={(e) =>
                handleLineItemChange(i, "itemType", e.target.value)
              }
              className="border rounded p-1"
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label>Purity:</label>
            <select
              value={item.purity}
              onChange={(e) =>
                handleLineItemChange(i, "purity", e.target.value)
              }
              className="border rounded p-1"
            >
              {/* Purity options */}
              {item.itemType === "gold" ? (
                <>
                  <option value="24K">24K</option>
                  <option value="22K">22K</option>
                  <option value="18K">18K</option>
                </>
              ) : (
                <>
                  <option value="Standard">Standard</option>
                  <option value="Sterling">Sterling</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label>Weight:</label>
            <input
              type="number"
              value={item.weight.value}
              min="0"
              onChange={(e) =>
                handleLineItemChange(i, "weightValue", e.target.value)
              }
              className="border rounded p-1 w-24"
            />
            <select
              value={item.weight.unit}
              onChange={(e) =>
                handleLineItemChange(i, "weightUnit", e.target.value)
              }
              className="border rounded p-1"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="mg">mg</option>
              <option value="tola">tola</option>
            </select>
          </div>

          <div>
            <label>Labour Charge:</label>
            <select
              value={item.labourChargeReferenceId || ""}
              onChange={(e) =>
                handleLineItemChange(
                  i,
                  "labourChargeReferenceId",
                  e.target.value
                )
              }
              className="border rounded p-1"
            >
              <option value="">None</option>
              {labourCharges
                ?.filter((lc) => lc.isActive)
                .map((lc) => (
                  <option key={lc._id} value={lc._id}>
                    {lc.name} (
                    {lc.chargeType === "perGram" ? "per gram" : "fixed"})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <span>
              <strong>Item Total:</strong> ₹{item.itemTotal.toFixed(2)}
            </span>
          </div>
        </div>
      ))}

      <button
        onClick={() =>
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
          ])
        }
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Item
      </button>

      <hr className="my-4" />

      <div>
        <label>GST %:</label>
        <input
          type="number"
          value={GSTPercent}
          onChange={(e) => setGSTPercent(Number(e.target.value))}
          className="border rounded p-1 w-20"
        />
      </div>

      <div>
        <label>Payment Mode:</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="border rounded p-1"
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bankTransfer">Bank Transfer</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label>Amount Paid:</label>
        <input
          type="number"
          value={amountPaid}
          min="0"
          onChange={(e) => setAmountPaid(Number(e.target.value))}
          className="border rounded p-1"
        />
      </div>

      <div className="my-4">
        <strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}
        <br />
        <strong>GST Amount:</strong> ₹{GSTAmount.toFixed(2)}
        <br />
        <strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}
        <br />
        <strong>Balance Due:</strong> ₹{balanceDue.toFixed(2)}
        <br />
      </div>

      <button
        onClick={handleSubmit}
        disabled={createInvoice.isLoading}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        {createInvoice.isLoading ? "Saving..." : "Finalize Invoice"}
      </button>

      {createInvoice.data && (
        <div className="my-6">
          <h3 className="font-semibold">Invoice QR Code</h3>
          <InvoiceQRCode data={createInvoice.data.QRCodeData || ""} />
        </div>
      )}
    </div>
  );
}
