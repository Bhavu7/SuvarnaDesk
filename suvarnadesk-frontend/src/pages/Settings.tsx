import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdSettings, MdSave, MdStore, MdLocationOn } from "react-icons/md";
import apiClient from "../api/apiClient";
import { showToast } from "../components/CustomToast";

interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  gstNumber?: string;
  logoUrl?: string;
  ownerName?: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: "",
    address: "",
    phone: "",
    gstNumber: "",
    logoUrl: "",
    ownerName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/shop-settings");
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch shop settings:", error);
      // If no settings exist, use defaults
      if (error.response?.status === 404) {
        showToast.error("No existing settings found. Creating new ones...");
      } else {
        showToast.error("Failed to load shop settings");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Use PUT request for shop-settings (not POST)
      const response = await apiClient.put("/shop-settings", settings);

      showToast.success("Shop settings saved successfully!");
      console.log("Settings saved:", response.data);
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      showToast.error(error.response?.data?.error || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ShopSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading shop settings...</p>
        </div>
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
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <MdSettings className="text-2xl text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Shop Settings</h2>
          <p className="text-gray-600">
            Manage your jewelry shop information and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Settings Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shop Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <MdStore className="text-xl text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Shop Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Shop Name *
                </label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) =>
                    handleInputChange("shopName", e.target.value)
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your shop name"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={settings.ownerName || ""}
                  onChange={(e) =>
                    handleInputChange("ownerName", e.target.value)
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter owner's name"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  GST Number
                </label>
                <input
                  type="text"
                  value={settings.gstNumber || ""}
                  onChange={(e) =>
                    handleInputChange("gstNumber", e.target.value)
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="GSTINXXXXXXXXXX"
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <MdLocationOn className="text-xl text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Contact Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your shop address"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={
                isSaving ||
                !settings.shopName ||
                !settings.address ||
                !settings.phone
              }
              className="flex items-center gap-2 px-8 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSave className="text-lg" />
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>
          </motion.div>
        </div>

        {/* Preview Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Settings Preview */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h4 className="mb-4 font-semibold text-gray-800">
              Settings Preview
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Shop Name:</span>
                <p className="font-medium">{settings.shopName || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">Owner:</span>
                <p className="font-medium">{settings.ownerName || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">GST Number:</span>
                <p className="font-medium">{settings.gstNumber || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium">{settings.phone || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">Address:</span>
                <p className="font-medium">{settings.address || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
            <h4 className="mb-3 font-semibold text-blue-800">💡 Quick Tips</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Fill all required fields marked with *</li>
              <li>• GST number should be in proper format</li>
              <li>• Phone number should include country code</li>
              <li>• Address will be printed on invoices</li>
              <li>• Shop name appears on all documents</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
