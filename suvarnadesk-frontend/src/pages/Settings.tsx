import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MdSettings,
  MdSave,
  MdStore,
  MdLocationOn,
  MdCurrencyRupee,
  MdCreditCard,
  MdPerson,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { showToast } from "../components/CustomToast";
import LoadingSpinner from "../components/LoadingSpinner";

interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  goldGstNumber?: string;
  silverGstNumber?: string;
  goldPanNumber?: string;
  silverPanNumber?: string;
  goldOwnerName?: string; // Added: Gold specific owner name
  silverOwnerName?: string; // Added: Silver specific owner name
  logoUrl?: string;
  ownerName?: string; // Keep main owner name for backward compatibility
}

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: "",
    address: "",
    phone: "",
    goldGstNumber: "",
    silverGstNumber: "",
    goldPanNumber: "",
    silverPanNumber: "",
    goldOwnerName: "Jay Krushna Haribhai Soni", // Added with default value
    silverOwnerName: "M/s Yogeshkumar and Brothers", // Added with default value
    logoUrl: "",
    ownerName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchShopSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/shop-settings");

      if (response.data) {
        const data = response.data;
        setSettings({
          shopName: data.shopName || "",
          address: data.address || "",
          phone: data.phone || "",
          goldGstNumber: data.goldGstNumber || "",
          silverGstNumber: data.silverGstNumber || "",
          goldPanNumber: data.goldPanNumber || "",
          silverPanNumber: data.silverPanNumber || "",
          goldOwnerName: data.goldOwnerName || "Jay Krushna Haribhai Soni", // Added
          silverOwnerName:
            data.silverOwnerName || "M/s Yogeshkumar and Brothers", // Added
          logoUrl: data.logoUrl || "",
          ownerName: data.ownerName || "",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch shop settings:", error);

      if (error.response?.status === 404) {
        // Redirect to NotFound page for 404 errors
        setNotFound(true);
        navigate("/404");
      } else {
        showToast.error("Failed to load shop settings");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchShopSettings();
  }, [fetchShopSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate GST numbers format
      if (settings.goldGstNumber && !isValidGST(settings.goldGstNumber)) {
        showToast.error("Please enter a valid GST number for Gold");
        setIsSaving(false);
        return;
      }

      if (settings.silverGstNumber && !isValidGST(settings.silverGstNumber)) {
        showToast.error("Please enter a valid GST number for Silver");
        setIsSaving(false);
        return;
      }

      // Validate PAN numbers format
      if (settings.goldPanNumber && !isValidPAN(settings.goldPanNumber)) {
        showToast.error("Please enter a valid PAN number for Gold");
        setIsSaving(false);
        return;
      }

      if (settings.silverPanNumber && !isValidPAN(settings.silverPanNumber)) {
        showToast.error("Please enter a valid PAN number for Silver");
        setIsSaving(false);
        return;
      }

      const response = await apiClient.put("/shop-settings", {
        shopName: settings.shopName,
        ownerName: settings.ownerName,
        goldOwnerName: settings.goldOwnerName, // Added
        silverOwnerName: settings.silverOwnerName, // Added
        address: settings.address,
        phone: settings.phone,
        goldGstNumber: settings.goldGstNumber,
        silverGstNumber: settings.silverGstNumber,
        goldPanNumber: settings.goldPanNumber,
        silverPanNumber: settings.silverPanNumber,
        logoUrl: settings.logoUrl,
      });

      showToast.success("Shop settings saved successfully!");
      console.log("Settings saved:", response.data);
    } catch (error: any) {
      console.error("Failed to save settings:", error);

      if (error.response?.status === 404) {
        setNotFound(true);
        navigate("/404");
      } else {
        showToast.error(
          error.response?.data?.error || "Failed to save settings"
        );
      }
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

  // GST number validation (basic format check)
  const isValidGST = (gstNumber: string): boolean => {
    if (!gstNumber || gstNumber.trim() === "") return true; // Allow empty GST
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
  };

  // PAN number validation
  const isValidPAN = (panNumber: string): boolean => {
    if (!panNumber || panNumber.trim() === "") return true; // Allow empty PAN
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(panNumber.toUpperCase());
  };

  const formatGSTForDisplay = (gstNumber: string): string => {
    if (!gstNumber || gstNumber.trim() === "") return "Not set";
    // Format as XX-XXXXX-XXXX-X-X-X
    if (gstNumber.length >= 15) {
      return `${gstNumber.slice(0, 2)}-${gstNumber.slice(
        2,
        7
      )}-${gstNumber.slice(7, 11)}-${gstNumber.slice(11, 12)}-${gstNumber.slice(
        12,
        13
      )}-${gstNumber.slice(13, 15)}`;
    }
    return gstNumber;
  };

  const formatPANForDisplay = (panNumber: string): string => {
    if (!panNumber || panNumber.trim() === "") return "Not set";
    return panNumber.toUpperCase();
  };

  const isSaveDisabled = (): boolean => {
    if (isSaving) return true;
    if (!settings.shopName || !settings.address || !settings.phone) return true;

    // Check if GST numbers are valid if they exist
    if (
      settings.goldGstNumber &&
      settings.goldGstNumber.trim() &&
      !isValidGST(settings.goldGstNumber)
    ) {
      return true;
    }

    if (
      settings.silverGstNumber &&
      settings.silverGstNumber.trim() &&
      !isValidGST(settings.silverGstNumber)
    ) {
      return true;
    }

    // Check if PAN numbers are valid if they exist
    if (
      settings.goldPanNumber &&
      settings.goldPanNumber.trim() &&
      !isValidPAN(settings.goldPanNumber)
    ) {
      return true;
    }

    if (
      settings.silverPanNumber &&
      settings.silverPanNumber.trim() &&
      !isValidPAN(settings.silverPanNumber)
    ) {
      return true;
    }

    return false;
  };

  // If not found, show nothing (will be redirected)
  if (notFound) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading shop settings..." />
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
            className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
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
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Main Owner Name
                </label>
                <input
                  type="text"
                  value={settings.ownerName || ""}
                  onChange={(e) =>
                    handleInputChange("ownerName", e.target.value)
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter main owner's name"
                />
              </div>
            </div>
          </motion.div>

          {/* Gold Tax & Owner Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 bg-white border border-yellow-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <MdCurrencyRupee className="text-xl text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Gold Information
              </h3>
            </div>

            <div className="space-y-6">
              {/* Gold Owner Name */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdPerson className="text-yellow-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Gold Owner Name *
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.goldOwnerName || ""}
                  onChange={(e) =>
                    handleInputChange("goldOwnerName", e.target.value)
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter Gold owner's name"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This name will appear on Gold invoices
                </p>
              </div>

              {/* Gold GST */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <label className="text-sm font-medium text-gray-700">
                    Gold GST Number
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.goldGstNumber || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "goldGstNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="GSTINXXXXXXXXXX (e.g., 22AAAAA0000A1Z5)"
                  maxLength={15}
                />
                {settings.goldGstNumber &&
                  settings.goldGstNumber.trim() &&
                  !isValidGST(settings.goldGstNumber) && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter a valid GST number format (15 characters)
                    </p>
                  )}
                {settings.goldGstNumber &&
                  settings.goldGstNumber.trim() &&
                  isValidGST(settings.goldGstNumber) && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Valid GST format:{" "}
                      {formatGSTForDisplay(settings.goldGstNumber)}
                    </p>
                  )}
              </div>

              {/* Gold PAN */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdCreditCard className="text-yellow-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Gold PAN Number
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.goldPanNumber || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "goldPanNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="PAN Number (e.g., ABCDE1234F)"
                  maxLength={10}
                />
                {settings.goldPanNumber &&
                  settings.goldPanNumber.trim() &&
                  !isValidPAN(settings.goldPanNumber) && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter a valid PAN number format (10 characters:
                      ABCDE1234F)
                    </p>
                  )}
                {settings.goldPanNumber &&
                  settings.goldPanNumber.trim() &&
                  isValidPAN(settings.goldPanNumber) && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Valid PAN: {formatPANForDisplay(settings.goldPanNumber)}
                    </p>
                  )}
              </div>
            </div>
          </motion.div>

          {/* Silver Tax & Owner Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <MdCurrencyRupee className="text-xl text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Silver Information
              </h3>
            </div>

            <div className="space-y-6">
              {/* Silver Owner Name */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdPerson className="text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Silver Owner Name *
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.silverOwnerName || ""}
                  onChange={(e) =>
                    handleInputChange("silverOwnerName", e.target.value)
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter Silver owner's name"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This name will appear on Silver invoices
                </p>
              </div>

              {/* Silver GST */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <label className="text-sm font-medium text-gray-700">
                    Silver GST Number
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.silverGstNumber || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "silverGstNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="GSTINXXXXXXXXXX (e.g., 22AAAAA0000A1Z5)"
                  maxLength={15}
                />
                {settings.silverGstNumber &&
                  settings.silverGstNumber.trim() &&
                  !isValidGST(settings.silverGstNumber) && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter a valid GST number format (15 characters)
                    </p>
                  )}
                {settings.silverGstNumber &&
                  settings.silverGstNumber.trim() &&
                  isValidGST(settings.silverGstNumber) && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Valid GST format:{" "}
                      {formatGSTForDisplay(settings.silverGstNumber)}
                    </p>
                  )}
              </div>

              {/* Silver PAN */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdCreditCard className="text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Silver PAN Number
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.silverPanNumber || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "silverPanNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="PAN Number (e.g., ABCDE1234F)"
                  maxLength={10}
                />
                {settings.silverPanNumber &&
                  settings.silverPanNumber.trim() &&
                  !isValidPAN(settings.silverPanNumber) && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter a valid PAN number format (10 characters:
                      ABCDE1234F)
                    </p>
                  )}
                {settings.silverPanNumber &&
                  settings.silverPanNumber.trim() &&
                  isValidPAN(settings.silverPanNumber) && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Valid PAN:{" "}
                      {formatPANForDisplay(settings.silverPanNumber)}
                    </p>
                  )}
              </div>
            </div>

            {/* Note about GST & PAN */}
            <div className="p-3 mt-6 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Enter separate owner names, GST and PAN
                numbers for Gold and Silver items. Different owner names allow
                you to maintain separate legal entities or partnerships for
                different metal types.
              </p>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
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
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 1234567890"
                  required
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
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaveDisabled()}
              className="flex items-center gap-2 px-8 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
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
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h4 className="mb-4 font-semibold text-gray-800">
              Settings Preview
            </h4>
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="block mb-1 text-xs font-medium text-gray-500">
                  Shop Name:
                </span>
                <p className="font-semibold text-gray-800">
                  {settings.shopName || "Not set"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="block mb-1 text-xs font-medium text-gray-500">
                  Main Owner:
                </span>
                <p className="font-medium text-gray-700">
                  {settings.ownerName || "Not set"}
                </p>
              </div>

              {/* Gold Information */}
              <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <span className="block mb-1 text-xs font-medium text-yellow-700">
                  Gold Owner:
                </span>
                <p className="font-semibold text-gray-800">
                  {settings.goldOwnerName || "Not set"}
                </p>
              </div>
              <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <span className="block mb-1 text-xs font-medium text-yellow-700">
                  Gold GST:
                </span>
                <p className="font-medium text-gray-800">
                  {settings.goldGstNumber
                    ? formatGSTForDisplay(settings.goldGstNumber)
                    : "Not set"}
                  {settings.goldGstNumber &&
                    settings.goldGstNumber.trim() &&
                    isValidGST(settings.goldGstNumber) && (
                      <span className="ml-2 text-xs text-green-600">
                        ✓ Valid
                      </span>
                    )}
                  {settings.goldGstNumber &&
                    settings.goldGstNumber.trim() &&
                    !isValidGST(settings.goldGstNumber) && (
                      <span className="ml-2 text-xs text-red-600">
                        ✗ Invalid
                      </span>
                    )}
                </p>
              </div>
              <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <span className="block mb-1 text-xs font-medium text-yellow-700">
                  Gold PAN:
                </span>
                <p className="font-medium text-gray-800">
                  {settings.goldPanNumber
                    ? formatPANForDisplay(settings.goldPanNumber)
                    : "Not set"}
                  {settings.goldPanNumber &&
                    settings.goldPanNumber.trim() &&
                    isValidPAN(settings.goldPanNumber) && (
                      <span className="ml-2 text-xs text-green-600">
                        ✓ Valid
                      </span>
                    )}
                  {settings.goldPanNumber &&
                    settings.goldPanNumber.trim() &&
                    !isValidPAN(settings.goldPanNumber) && (
                      <span className="ml-2 text-xs text-red-600">
                        ✗ Invalid
                      </span>
                    )}
                </p>
              </div>

              {/* Silver Information */}
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <span className="block mb-1 text-xs font-medium text-gray-700">
                  Silver Owner:
                </span>
                <p className="font-semibold text-gray-800">
                  {settings.silverOwnerName || "Not set"}
                </p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <span className="block mb-1 text-xs font-medium text-gray-700">
                  Silver GST:
                </span>
                <p className="font-medium text-gray-800">
                  {settings.silverGstNumber
                    ? formatGSTForDisplay(settings.silverGstNumber)
                    : "Not set"}
                  {settings.silverGstNumber &&
                    settings.silverGstNumber.trim() &&
                    isValidGST(settings.silverGstNumber) && (
                      <span className="ml-2 text-xs text-green-600">
                        ✓ Valid
                      </span>
                    )}
                  {settings.silverGstNumber &&
                    settings.silverGstNumber.trim() &&
                    !isValidGST(settings.silverGstNumber) && (
                      <span className="ml-2 text-xs text-red-600">
                        ✗ Invalid
                      </span>
                    )}
                </p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <span className="block mb-1 text-xs font-medium text-gray-700">
                  Silver PAN:
                </span>
                <p className="font-medium text-gray-800">
                  {settings.silverPanNumber
                    ? formatPANForDisplay(settings.silverPanNumber)
                    : "Not set"}
                  {settings.silverPanNumber &&
                    settings.silverPanNumber.trim() &&
                    isValidPAN(settings.silverPanNumber) && (
                      <span className="ml-2 text-xs text-green-600">
                        ✓ Valid
                      </span>
                    )}
                  {settings.silverPanNumber &&
                    settings.silverPanNumber.trim() &&
                    !isValidPAN(settings.silverPanNumber) && (
                      <span className="ml-2 text-xs text-red-600">
                        ✗ Invalid
                      </span>
                    )}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50">
                <span className="block mb-1 text-xs font-medium text-gray-500">
                  Phone:
                </span>
                <p className="font-medium text-gray-700">
                  {settings.phone || "Not set"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="block mb-1 text-xs font-medium text-gray-500">
                  Address:
                </span>
                <p className="font-medium text-gray-700">
                  {settings.address || "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="mb-3 font-semibold text-blue-800">💡 Quick Tips</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Fill all required fields marked with *</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Enter separate owner names for Gold and Silver</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Enter separate GST & PAN for each metal type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>GST format: 15 characters (22AAAAA0000A1Z5)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>PAN format: 10 characters (ABCDE1234F)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Different owner names allow separate legal entities</span>
              </li>
            </ul>
          </div>

          {/* Business Structure Info */}
          <div className="p-6 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2 mb-3">
              <MdStore className="text-lg text-yellow-700" />
              <h4 className="font-semibold text-yellow-800">
                Business Structure
              </h4>
            </div>
            <div className="text-sm text-yellow-700">
              <p className="mb-2">Why separate owner names?</p>
              <ul className="space-y-1">
                <li>• Different legal entities for Gold and Silver</li>
                <li>• Separate partnerships or proprietorships</li>
                <li>• Different tax registration requirements</li>
                <li>• Separate accounting and compliance</li>
                <li>• Allows for different business models</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
