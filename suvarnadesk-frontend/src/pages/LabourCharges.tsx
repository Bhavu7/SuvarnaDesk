import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdBuild, MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";
import {
  useLabourCharges,
  useCreateLabourCharge,
  useUpdateLabourCharge,
  useDeleteLabourCharge,
  LabourCharge,
} from "../hooks/useLabourCharges";
import CustomDropdown from "../components/CustomDropdown";
import { showToast } from "../components/CustomToast";
import { AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

export default function LabourCharges() {
  const { data: labourCharges, isLoading, refetch } = useLabourCharges();
  const createLabourCharge = useCreateLabourCharge();
  const updateLabourCharge = useUpdateLabourCharge();
  const deleteLabourCharge = useDeleteLabourCharge();

  const [showForm, setShowForm] = useState(false);
  const [editingCharge, setEditingCharge] = useState<LabourCharge | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    chargeType: "perGram" as "perGram" | "fixed",
    amount: 0,
    description: "",
    isActive: true,
  });

  const chargeTypeOptions = [
    { value: "perGram", label: "Per Gram" },
    { value: "fixed", label: "Fixed" },
  ];

  const handleAdd = () => {
    createLabourCharge.mutate(formData, {
      onSuccess: () => {
        showToast.success("Labour charge created successfully!");
        setShowForm(false);
        resetForm();
      },
      onError: (error: any) => {
        showToast.error(
          error.response?.data?.error || "Failed to create labour charge"
        );
      },
    });
  };

  const handleUpdate = () => {
    if (!editingCharge) return;

    updateLabourCharge.mutate(
      {
        id: editingCharge._id,
        data: formData,
      },
      {
        onSuccess: () => {
          showToast.success("Labour charge updated successfully!");
          setShowForm(false);
          setEditingCharge(null);
          resetForm();
        },
        onError: (error: any) => {
          showToast.error(
            error.response?.data?.error || "Failed to update labour charge"
          );
        },
      }
    );
  };

  const handleDelete = (charge: LabourCharge) => {
    if (window.confirm(`Are you sure you want to delete "${charge.name}"?`)) {
      deleteLabourCharge.mutate(charge._id, {
        onSuccess: () => {
          showToast.success("Labour charge deleted successfully!");
        },
        onError: (error: any) => {
          showToast.error(
            error.response?.data?.error || "Failed to delete labour charge"
          );
        },
      });
    }
  };

  const handleEdit = (charge: LabourCharge) => {
    setEditingCharge(charge);
    setFormData({
      name: charge.name,
      chargeType: charge.chargeType,
      amount: charge.amount,
      description: charge.description || "",
      isActive: charge.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      chargeType: "perGram",
      amount: 0,
      description: "",
      isActive: true,
    });
    setEditingCharge(null);
  };

  const getChargeTypeColor = (chargeType: string) => {
    return chargeType === "perGram" ? "text-blue-600" : "text-purple-600";
  };

  const getChargeTypeBgColor = (chargeType: string) => {
    return chargeType === "perGram" ? "bg-blue-100" : "bg-purple-100";
  };

  const getChargeTypeLabel = (chargeType: string) => {
    return chargeType === "perGram" ? "Per Gram" : "Fixed";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner text="Loading Labour Charges..." />
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
          <div className="p-3 bg-blue-100 rounded-xl">
            <MdBuild className="text-2xl text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Labour Charges</h2>
            <p className="text-gray-600">
              Manage making charges and labour costs
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-0"
        >
          <MdAdd className="text-lg" />
          Add Charge
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingCharge ? "Edit Labour Charge" : "Add Labour Charge"}
              </h3>
              <button
                title="Close"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Basic Making Charge"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Charge Type
                </label>
                <CustomDropdown
                  options={chargeTypeOptions}
                  value={formData.chargeType}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      chargeType: value as "perGram" | "fixed",
                    }))
                  }
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Amount (₹){" "}
                  {formData.chargeType === "perGram" ? "per gram" : "per item"}
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={editingCharge ? handleUpdate : handleAdd}
                disabled={
                  !formData.name.trim() ||
                  formData.amount <= 0 ||
                  (editingCharge
                    ? updateLabourCharge.isPending
                    : createLabourCharge.isPending)
                }
                className="px-6 py-3 text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
              >
                {editingCharge
                  ? updateLabourCharge.isPending
                    ? "Updating..."
                    : "Update Charge"
                  : createLabourCharge.isPending
                  ? "Creating..."
                  : "Create Charge"}
              </motion.button>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-3 text-gray-600 transition-all duration-200 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Labour Charges Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {labourCharges?.map((charge: LabourCharge, index: number) => (
          <motion.div
            key={charge._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${getChargeTypeBgColor(
                  charge.chargeType
                )}`}
              >
                <MdBuild
                  className={`text-xl ${getChargeTypeColor(charge.chargeType)}`}
                />
              </div>
              <div className="flex gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(charge)}
                  title="Edit"
                  className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-0"
                  disabled={updateLabourCharge.isPending}
                >
                  <MdEdit className="text-lg" />
                </button>
                <button
                  onClick={() => handleDelete(charge)}
                  title="Delete"
                  className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 focus:outline-none focus:ring-0"
                  disabled={deleteLabourCharge.isPending}
                >
                  <MdDelete className="text-lg" />
                </button>
              </div>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              {charge.name}
            </h3>

            <div className="mb-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Type:</span>
                <span
                  className={`font-medium capitalize ${getChargeTypeColor(
                    charge.chargeType
                  )}`}
                >
                  {getChargeTypeLabel(charge.chargeType)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium text-green-600">
                  ₹{charge.amount.toFixed(2)}
                  {charge.chargeType === "perGram" ? "/g" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-medium ${
                    charge.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {charge.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {charge.description && (
              <p className="pt-3 text-sm text-gray-500 border-t border-gray-100">
                {charge.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {(!labourCharges || labourCharges.length === 0) && !showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <MdBuild className="mx-auto mb-4 text-4xl text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No labour charges
          </h3>
          <p className="mb-4 text-gray-500">
            Add labour charges to use in your invoices
          </p>
          <button
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
            className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-0"
          >
            Add First Charge
          </button>
        </motion.div>
      )}

      {/* Loading States */}
      {(createLabourCharge.isPending ||
        updateLabourCharge.isPending ||
        deleteLabourCharge.isPending) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-xl">
            <LoadingSpinner text="Processing..." />
          </div>
        </div>
      )}
    </motion.div>
  );
}
