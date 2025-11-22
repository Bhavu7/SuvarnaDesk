import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export default function Settings() {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [GSTNumber, setGSTNumber] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  useEffect(() => {
    (async () => {
      const res = await apiClient.get("/shop-settings");
      const data = res.data;
      setShopName(data.shopName || "");
      setOwnerName(data.ownerName || "");
      setGSTNumber(data.GSTNumber || "");
      setAddress(data.address || "");
      setContactNumber(data.contactNumber || "");
    })();
  }, []);

  const handleSave = async () => {
    await apiClient.post("/shop-settings", {
      shopName,
      ownerName,
      GSTNumber,
      address,
      contactNumber,
    });
    alert("Settings saved");
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Shop Settings</h1>
      <div className="max-w-xl space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Shop Name</label>
          <input
            title="input"
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Owner Name</label>
          <input
            title="input"
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">GST Number</label>
          <input
            title="input"
            type="text"
            value={GSTNumber}
            onChange={(e) => setGSTNumber(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Address</label>
          <textarea
            title="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Contact Number</label>
          <input
            title="input"
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
