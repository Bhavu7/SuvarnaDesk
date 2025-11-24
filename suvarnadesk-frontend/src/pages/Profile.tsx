import React, { useState, useEffect } from "react";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdEdit,
  MdSave,
  MdCancel,
} from "react-icons/md";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { showToast } from "../components/CustomToast";

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  memberSince?: string;
  lastLogin?: string;
}

const fetchAdminProfile = async (): Promise<AdminProfile> => {
  const { data } = await apiClient.get("/admin/profile");
  return data;
};

const updateAdminProfile = async (
  profileData: Partial<AdminProfile>
): Promise<AdminProfile> => {
  const { data } = await apiClient.put("/admin/profile", profileData);
  return data;
};

const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AdminProfile, Error>({
    queryKey: ["adminProfile"],
    queryFn: fetchAdminProfile,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminProfile>>({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (data: AdminProfile) => {
      showToast.success("Profile updated successfully!");
      queryClient.setQueryData(["adminProfile"], data);
      setIsEditing(false);
    },
    onError: (error: Error) => {
      showToast.error("Failed to update profile");
      console.error("Profile update error:", error);
    },
  });

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.email?.trim()) {
      showToast.error("Name and email are required");
      return;
    }
    mutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <MdPerson className="text-2xl text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
            <p className="text-gray-600">
              Manage your personal information and account settings
            </p>
          </div>
        </div>

        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <MdEdit className="text-lg" />
            Edit Profile
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={mutation.isPending}
              className={`flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 rounded-lg ${
                mutation.isPending
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <MdSave className="text-lg" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </motion.button>
            <button
              onClick={handleCancel}
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 transition-all duration-200 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <MdCancel className="text-lg" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h3 className="mb-6 text-lg font-semibold text-gray-800">
              Personal Information
            </h3>

            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <MdPerson className="flex-shrink-0 text-xl text-gray-600" />
                <div className="flex-1">
                  <p className="mb-1 text-sm text-gray-600">Full Name</p>
                  {isEditing ? (
                    <input
                      title="Full Name"
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{formData.name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <MdEmail className="flex-shrink-0 text-xl text-gray-600" />
                <div className="flex-1">
                  <p className="mb-1 text-sm text-gray-600">Email Address</p>
                  {isEditing ? (
                    <input
                      title="Email Address"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">
                      {formData.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <MdPhone className="flex-shrink-0 text-xl text-gray-600" />
                <div className="flex-1">
                  <p className="mb-1 text-sm text-gray-600">Phone Number</p>
                  {isEditing ? (
                    <input
                      title="Phone Number"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">
                      {formData.phone || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MdPerson className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {user?.role || "admin"}
                  </p>
                </div>
              </div>
            </div>

            {mutation.isError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 mt-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50"
              >
                Failed to update profile. Please try again.
              </motion.div>
            )}
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h3 className="mb-6 text-lg font-semibold text-gray-800">
              Security
            </h3>
            <button className="w-full p-4 text-left text-blue-600 transition-colors border border-blue-200 rounded-lg hover:bg-blue-50">
              Change Password
            </button>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-2xl font-semibold text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                {formData.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                {formData.name}
              </h4>
              <p className="mt-1 text-sm text-gray-500">{formData.email}</p>
              <div className="inline-block px-3 py-1 mt-3 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "Admin"}
              </div>
            </div>
          </motion.div>

          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h4 className="mb-4 font-semibold text-gray-800">Account Status</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {user?.memberSince || "2024"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium">
                  {user?.lastLogin || "Today"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <h4 className="mb-4 font-semibold text-gray-800">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full p-3 text-left text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                Notification Settings
              </button>
              <button className="w-full p-3 text-left text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                Privacy Settings
              </button>
              <button className="w-full p-3 text-left text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                Two-Factor Authentication
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
