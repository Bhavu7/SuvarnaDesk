import React, { useState } from "react";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdEdit,
  MdSave,
  MdCancel,
} from "react-icons/md";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from '../components/CustomToast';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Super Admin",
    email: user?.email || "admin@example.com",
    phone: user?.phone || "+91 1234567890",
  });

  const handleSave = () => {
    // In a real app, you would make an API call to update the profile
    showToast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "Super Admin",
      email: user?.email || "admin@example.com",
      phone: user?.phone || "+91 1234567890",
    });
    setIsEditing(false);
  };

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
              className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700"
            >
              <MdSave className="text-lg" />
              Save Changes
            </motion.button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 transition-all duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <MdCancel className="text-lg" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Information */}
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
                      title="form inputs"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      title="form inputs"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      title="form inputs"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">
                      {formData.phone}
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
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                {formData.name}
              </h4>
              <p className="mt-1 text-sm text-gray-500">{formData.email}</p>
              <div className="inline-block px-3 py-1 mt-3 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                {user?.role || "Admin"}
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
                <span className="font-medium">2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium">Today</span>
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
