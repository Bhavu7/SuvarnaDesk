import React, { useState } from "react";
import { useMetalRates, useUpdateMetalRate } from "../hooks/useMetalRates";

export default function Rates() {
  const { data: rates, isLoading } = useMetalRates();
  const updateRate = useUpdateMetalRate();

  const [metalType, setMetalType] = useState("gold");
  const [purity, setPurity] = useState("24K");
  const [ratePerGram, setRatePerGram] = useState(0);

  const handleAddOrUpdate = () => {
    updateRate.mutate({
      metalType,
      purity,
      ratePerGram: parseFloat(ratePerGram.toString()),
      effectiveFrom: new Date(),
      source: "manual",
      isActive: true,
    });
  };

  if (isLoading) return <div>Loading metal rates...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Metal Rate Management</h1>

      <div className="mb-4 border p-4 rounded bg-white">
        <div className="mb-2">
          <label className="mr-2 font-semibold">Metal Type</label>
          <select
            value={metalType}
            onChange={(e) => setMetalType(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="mr-2 font-semibold">Purity</label>
          <input
            type="text"
            value={purity}
            onChange={(e) => setPurity(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="mb-2">
          <label className="mr-2 font-semibold">Rate Per Gram</label>
          <input
            type="number"
            value={ratePerGram}
            onChange={(e) => setRatePerGram(Number(e.target.value))}
            className="border p-1 rounded"
          />
        </div>
        <button
          onClick={handleAddOrUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add / Update Rate
        </button>
      </div>

      <div>
        <h2 className="text-xl mb-2">Current Rates</h2>
        {rates?.map((rate: any) => (
          <div key={rate._id} className="border p-2 mb-2 rounded bg-white">
            {rate.metalType} ({rate.purity}) : ₹{rate.ratePerGram.toFixed(2)} /
            g
          </div>
        ))}
      </div>
    </div>
  );
}
