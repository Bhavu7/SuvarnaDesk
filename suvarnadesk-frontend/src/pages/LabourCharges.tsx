import React, { useState } from "react";
import {
  useLabourCharges,
  useCreateLabourCharge,
} from "../hooks/useLabourCharges";

export default function LabourCharges() {
  const { data: labourCharges, isLoading } = useLabourCharges();
  const createLabourCharge = useCreateLabourCharge();

  const [name, setName] = useState("");
  const [chargeType, setChargeType] = useState<"perGram" | "fixedPerItem">(
    "perGram"
  );
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleAdd = () => {
    createLabourCharge.mutate({
      name,
      chargeType,
      amount,
      description,
      isActive,
    });
  };

  if (isLoading) return <div>Loading labour charges...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Labour Charge Management</h1>

      <div className="mb-6 p-4 border rounded bg-white">
        <label className="block mb-1 font-semibold">Name</label>
        <input
          title="title"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mb-3 rounded w-full"
        />

        <label className="block mb-1 font-semibold">Charge Type</label>
        <select
          title="title"
          value={chargeType}
          onChange={(e) => setChargeType(e.target.value as any)}
          className="border p-2 mb-3 rounded w-full"
        >
          <option value="perGram">Per Gram</option>
          <option value="fixedPerItem">Fixed Per Item</option>
        </select>

        <label className="block mb-1 font-semibold">Amount</label>
        <input
          title="title"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2 mb-3 rounded w-full"
        />

        <label className="block mb-1 font-semibold">
          Description (optional)
        </label>
        <textarea
          title="title"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 mb-3 rounded w-full"
        />

        <label className="inline-flex items-center mb-4">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2">Active</span>
        </label>

        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Add Labour Charge
        </button>
      </div>

      <div>
        <h2 className="text-xl mb-2">Existing Labour Charges</h2>
        {labourCharges?.map((lc: any) => (
          <div key={lc._id} className="border p-2 rounded mb-2 bg-white">
            <div>
              <strong>{lc.name}</strong>
            </div>
            <div>Type: {lc.chargeType}</div>
            <div>Amount: ₹{lc.amount.toFixed(2)}</div>
            <div>{lc.description}</div>
            <div>Status: {lc.isActive ? "Active" : "Inactive"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
