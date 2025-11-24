import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdTrendingUp, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import {
  useMetalRates,
  useUpdateMetalRate,
  MetalRateInput,
} from "../hooks/useMetalRates";
import CustomDropdown from "../components/CustomDropdown";
import { showToast } from "../components/CustomToast";

export default function Rates() {
  const { data: rates, isLoading } = useMetalRates();
  const updateRate = useUpdateMetalRate();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<MetalRateInput>({
    metalType: "gold",
    purity: "24K",
    ratePerGram: 0,
    effectiveFrom: new Date().toISOString().split("T")[0],
    source: "manual",
    isActive: true,
  });

  const metalTypeOptions = [
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
  ];

  const purityOptions: Record<
    string,
    Array<{ value: string; label: string }>
  > = {
    gold: [
      { value: "24K", label: "24K" },
      { value: "22K", label: "22K" },
      { value: "18K", label: "18K" },
    ],
    silver: [
      { value: "999", label: "999 (Pure)" },
      { value: "925", label: "925 (Sterling)" },
      { value: "900", label: "900" },
    ],
  };

  const handleAddOrUpdate = () => {
    updateRate.mutate(formData, {
      onSuccess: () => {
        showToast.success("Metal rate updated successfully!");
        setShowForm(false);
        setFormData({
          metalType: "gold",
          purity: "24K",
          ratePerGram: 0,
          effectiveFrom: new Date().toISOString().split("T")[0],
          source: "manual",
          isActive: true,
        });
      },
      onError: (error: any) => {
        showToast.error(error.response?.data?.error || "Failed to update rate");
      },
    });
  };

  const getMetalColor = (metalType: string) => {
    return metalType === "gold" ? "text-yellow-600" : "text-gray-400";
  };

  const getMetalBgColor = (metalType: string) => {
    return metalType === "gold" ? "bg-yellow-100" : "bg-gray-100";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading metal rates...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <MdTrendingUp className="text-2xl text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Metal Rates</h2>
            <p className="text-gray-600">
              Manage gold and silver rates for pricing
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          aria-label="Add new metal rate"
        >
          <MdAdd className="text-lg" />
          Add Rate
        </motion.button>
      </div>

      {/* Add/Update Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Add Metal Rate
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="metal-type"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Metal Type
                </label>
                <CustomDropdown
                  options={metalTypeOptions}
                  value={formData.metalType}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      metalType: value as "gold" | "silver",
                      purity: value === "gold" ? "24K" : "999",
                    }))
                  }
                  aria-label="Select metal type"
                />
              </div>

              <div>
                <label
                  htmlFor="purity"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Purity
                </label>
                <CustomDropdown
                  options={purityOptions[formData.metalType]}
                  value={formData.purity}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, purity: value }))
                  }
                  aria-label="Select purity"
                />
              </div>

              <div>
                <label
                  htmlFor="rate-per-gram"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Rate Per Gram (₹)
                </label>
                <input
                  id="rate-per-gram"
                  type="number"
                  value={formData.ratePerGram}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ratePerGram: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  aria-label="Enter rate per gram"
                />
              </div>

              <div>
                <label
                  htmlFor="effective-from"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Effective From
                </label>
                <input
                  id="effective-from"
                  type="date"
                  value={formData.effectiveFrom as string}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      effectiveFrom: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  aria-label="Select effective date"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddOrUpdate}
                disabled={updateRate.isPending || !formData.ratePerGram}
                className="px-6 py-3 text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save metal rate"
              >
                {updateRate.isPending ? "Saving..." : "Save Rate"}
              </motion.button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-gray-600 transition-all duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Cancel adding metal rate"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Rates */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rates
          ?.filter((rate) => rate.isActive)
          .map((rate, index) => (
            <motion.div
              key={rate._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${getMetalBgColor(
                    rate.metalType
                  )}`}
                >
                  <MdTrendingUp
                    className={`text-xl ${getMetalColor(rate.metalType)}`}
                  />
                </div>
                <div className="flex gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                  <button
                    className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    aria-label={`Edit ${rate.metalType} rate`}
                    title="Edit rate"
                  >
                    <MdEdit className="text-lg" />
                  </button>
                  <button
                    className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    aria-label={`Delete ${rate.metalType} rate`}
                    title="Delete rate"
                  >
                    <MdDelete className="text-lg" />
                  </button>
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 capitalize">
                  {rate.metalType} ({rate.purity})
                </h3>
                <div className="mb-2 text-2xl font-bold text-gray-900">
                  ₹{rate.ratePerGram.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / gram
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Effective from{" "}
                  {new Date(rate.effectiveFrom as string).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Source:</span>
                  <span className="capitalize">{rate.source}</span>
                </div>
                <div className="flex justify-between mt-1 text-sm text-gray-600">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {(!rates || rates.filter((rate) => rate.isActive).length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <MdTrendingUp className="mx-auto mb-4 text-4xl text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No active rates
          </h3>
          <p className="mb-4 text-gray-500">
            Add current metal rates to enable pricing
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="font-medium text-yellow-600 hover:text-yellow-700"
            aria-label="Add first metal rate"
          >
            Add First Rate
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
