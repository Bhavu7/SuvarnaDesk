import React, { useState } from "react";
import { useCustomers, Customer } from "../hooks/useCustomers";
import { useLabourCharges, LabourCharge } from "../hooks/useLabourCharges";
import { useMetalRates, MetalRate } from "../hooks/useMetalRates";
import { useCreateInvoice, LineItem } from "../hooks/useBilling";
import InvoiceQRCode from "../components/InvoiceQRCode";

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

  const handleSubmit = () => {
    if (!selectedCustomer) {
      alert("Select customer");
      return;
    }

    if (createInvoice.isLoading) return;

    createInvoice.mutate({
      invoiceNumber: `INV-${Date.now()}`,
      date: invoiceDate,
      customerId: selectedCustomer,
      customerSnapshot:
        customers?.find((c: Customer) => c._id === selectedCustomer) || {},
      lineItems,
      totals: { subtotal, GSTPercent, GSTAmount, grandTotal },
      paymentDetails: { paymentMode, amountPaid, balanceDue },
      QRCodeData: `Invoice INV-${Date.now()}, Total: ${grandTotal.toFixed(2)}`,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>

      <label htmlFor="invoice-date" className="block mb-1">
        Date:
      </label>
      <input
        id="invoice-date"
        type="date"
        value={invoiceDate}
        onChange={(e) => setInvoiceDate(e.target.value)}
        className="border rounded p-1 mb-4"
      />

      <label htmlFor="customer-select" className="block mb-1">
        Customer:
      </label>
      <select
        id="customer-select"
        value={selectedCustomer}
        onChange={(e) => setSelectedCustomer(e.target.value)}
        className="border rounded p-1 mb-4"
      >
        <option value="">Select Customer</option>
        {customers?.map((c: Customer) => (
          <option key={c._id} value={c._id}>
            {c.name} - {c.phone}
          </option>
        ))}
      </select>

      <hr className="my-4" />

      {lineItems.map((item, i) => (
        <div key={i} className="border p-4 mb-3 rounded space-y-2 bg-white">
          <div>
            <label htmlFor={`itemType-${i}`}>Item Type:</label>
            <select
              id={`itemType-${i}`}
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
            <label htmlFor={`purity-${i}`}>Purity:</label>
            <select
              id={`purity-${i}`}
              value={item.purity}
              onChange={(e) =>
                handleLineItemChange(i, "purity", e.target.value)
              }
              className="border rounded p-1"
            >
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
            <label htmlFor={`weightValue-${i}`}>Weight:</label>
            <input
              id={`weightValue-${i}`}
              type="number"
              min={0}
              value={item.weight.value}
              onChange={(e) =>
                handleLineItemChange(i, "weightValue", e.target.value)
              }
              className="border rounded p-1 w-24"
            />
            <select
              aria-label={`Weight unit for item ${i + 1}`}
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
            <label htmlFor={`labourCharge-${i}`}>Labour Charge:</label>
            <select
              id={`labourCharge-${i}`}
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
                .map((lc: LabourCharge) => (
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
        <label htmlFor="gstPercent">GST %:</label>
        <input
          id="gstPercent"
          type="number"
          value={GSTPercent}
          onChange={(e) => setGSTPercent(Number(e.target.value))}
          className="border rounded p-1 w-20"
          placeholder="GST %"
        />
      </div>

      <div>
        <label htmlFor="paymentMode">Payment Mode:</label>
        <select
          id="paymentMode"
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
        <label htmlFor="amountPaid">Amount Paid:</label>
        <input
          id="amountPaid"
          type="number"
          min={0}
          value={amountPaid}
          onChange={(e) => setAmountPaid(Number(e.target.value))}
          className="border rounded p-1"
          placeholder="Amount Paid"
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
