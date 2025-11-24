import React from "react";
import { MdPerson, MdEmail, MdPhone, MdEdit } from "react-icons/md";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3">
        <MdPerson className="text-3xl text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Personal Information
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-50">
              <MdEdit className="text-lg" />
              Edit Profile
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
              <MdPerson className="text-xl text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">
                  {user?.name || "Super Admin"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
              <MdEmail className="text-xl text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-900">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
              <MdPhone className="text-xl text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-900">
                  {user?.phone || "+91 1234567890"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
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

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h4 className="mb-3 font-semibold text-gray-800">Account Status</h4>
            <div className="space-y-2">
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
          </div>

          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h4 className="mb-3 font-semibold text-gray-800">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full p-2 text-left text-blue-600 transition-colors rounded hover:bg-blue-50">
                Change Password
              </button>
              <button className="w-full p-2 text-left text-blue-600 transition-colors rounded hover:bg-blue-50">
                Notification Settings
              </button>
              <button className="w-full p-2 text-left text-blue-600 transition-colors rounded hover:bg-blue-50">
                Privacy Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
