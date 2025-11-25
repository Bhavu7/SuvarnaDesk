import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MdWork,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSchedule,
  MdPerson,
} from "react-icons/md";
import { useWorkerJobs, useCreateWorkerJob } from "../hooks/useWorkerJobs";
import CustomDropdown from "../components/CustomDropdown";
import { showToast } from "../components/CustomToast";
import { AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WorkerJobs() {
  const { data: jobs, isLoading } = useWorkerJobs();
  const createJobMutation = useCreateWorkerJob();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    jobType: "repair" as "repair" | "modification" | "custom",
    status: "received" as
      | "received"
      | "inProgress"
      | "ready"
      | "delivered"
      | "cancelled",
    metalType: "gold",
    estimatedCharges: 0,
    paymentStatus: "unpaid" as "unpaid" | "partial" | "paid",
  });

  const jobTypeOptions = [
    { value: "repair", label: "Repair" },
    { value: "modification", label: "Modification" },
    { value: "custom", label: "Custom" },
  ];

  const statusOptions = [
    { value: "received", label: "Received" },
    { value: "inProgress", label: "In Progress" },
    { value: "ready", label: "Ready" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "unpaid", label: "Unpaid" },
    { value: "partial", label: "Partial" },
    { value: "paid", label: "Paid" },
  ];

  const handleAddJob = () => {
    createJobMutation.mutate(
      {
        ...formData,
        estimatedWeightBefore: { value: 0, unit: "g" },
        estimatedWeightAfter: { value: 0, unit: "g" },
        receivedDate: new Date().toISOString(),
        promisedDeliveryDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        onSuccess: () => {
          showToast.success("Worker job created successfully!");
          setShowCreateForm(false);
          setFormData({
            description: "",
            jobType: "repair",
            status: "received",
            metalType: "gold",
            estimatedCharges: 0,
            paymentStatus: "unpaid",
          });
        },
        onError: (error: any) => {
          showToast.error(
            error.response?.data?.error || "Failed to create job"
          );
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-800";
      case "inProgress":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading worker jobs..." />
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
          <div className="p-3 bg-purple-100 rounded-xl">
            <MdWork className="text-2xl text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Worker Jobs</h2>
            <p className="text-gray-600">
              Manage jewelry repair and customization jobs
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <MdAdd className="text-lg" />
          New Job
        </motion.button>
      </div>

      {/* Create Job Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Create New Job
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Job description..."
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Job Type
                  </label>
                  <CustomDropdown
                    options={jobTypeOptions}
                    value={formData.jobType}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        jobType: value as any,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <CustomDropdown
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value as any }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Estimated Charges
                </label>
                <input
                  type="number"
                  value={formData.estimatedCharges}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedCharges: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Payment Status
                </label>
                <CustomDropdown
                  options={paymentStatusOptions}
                  value={formData.paymentStatus}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentStatus: value as any,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddJob}
                disabled={createJobMutation.isPending || !formData.description}
                className="px-6 py-3 text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createJobMutation.isPending ? "Creating..." : "Create Job"}
              </motion.button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 text-gray-600 transition-all duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {jobs?.map((job: any, index: number) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  #{job.jobNumber || "N/A"}
                </h3>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </div>
              <div className="flex gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                <button
                  title="Edit"
                  className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                >
                  <MdEdit className="text-lg" />
                </button>
                <button
                  title="Delete"
                  className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <MdDelete className="text-lg" />
                </button>
              </div>
            </div>

            <p className="mb-4 text-gray-600 line-clamp-2">{job.description}</p>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MdWork className="text-gray-400" />
                <span className="capitalize">{job.jobType}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdSchedule className="text-gray-400" />
                <span>{new Date(job.receivedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdPerson className="text-gray-400" />
                <span>₹{job.estimatedCharges?.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
              <span
                className={`text-sm font-medium ${
                  job.paymentStatus === "paid"
                    ? "text-green-600"
                    : job.paymentStatus === "partial"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {job.paymentStatus}
              </span>
              <span className="text-xs text-gray-500">
                {job.promisedDeliveryDate
                  ? new Date(job.promisedDeliveryDate).toLocaleDateString()
                  : "No date"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {(!jobs || jobs.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <MdWork className="mx-auto mb-4 text-4xl text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No jobs found
          </h3>
          <p className="mb-4 text-gray-500">
            Get started by creating your first worker job
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="font-medium text-purple-600 hover:text-purple-700"
          >
            Create New Job
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
