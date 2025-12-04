import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdInventory,
  MdAdd,
  MdEdit,
  MdDelete,
  MdPictureAsPdf,
  MdCalendarToday,
  MdDiamond,
  MdOutlineDiamond,
  MdAllInbox,
} from "react-icons/md";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  Product,
} from "../hooks/useStock";
import { showToast } from "../components/CustomToast";
import CustomDropdown from "../components/CustomDropdown";
import DateDropdown from "../components/DateDropdown";
import { pdf } from "@react-pdf/renderer";
import StockReportPDF, { StockProduct } from "../components/StockReportPDF";
import apiClient from "../api/apiClient";

const emptyForm: Product = {
  productNo: "",
  name: "",
  productType: "gold",
  quantity: 0,
  hsnCode: "",
  weight: 0,
  weightUnit: "g",
};

interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  goldGstNumber?: string;
  silverGstNumber?: string;
  goldPanNumber?: string;
  silverPanNumber?: string;
  goldOwnerName?: string;
  silverOwnerName?: string;
  logoUrl?: string;
  ownerName?: string;
}

// Extend Product interface to include createdAt
interface ProductWithDate extends Product {
  createdAt?: string;
}

// Update the report type to include date-range
type ReportType = "gold" | "silver" | "all" | "date-range";

// Type for date range product type selection
type DateRangeProductType = "gold" | "silver" | "both";

const Stock: React.FC = () => {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formData, setFormData] = useState<Product>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showReportTypeDialog, setShowReportTypeDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType>("all");
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Date range states
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");
  const [dateRangeProductType, setDateRangeProductType] =
    useState<DateRangeProductType>("both");

  // Fetch shop settings
  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await apiClient.get("/shop-settings");
        if (response.data) {
          setShopSettings(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch shop settings:", error);
        setShopSettings({
          shopName: "SuvarnaDesk Jewellery",
          address: "near ashok stambh, choksi bazar anand 388001",
          phone: "",
          goldGstNumber: "",
          silverGstNumber: "",
          goldPanNumber: "",
          silverPanNumber: "",
          goldOwnerName: "Jay Krushna Haribhai Soni",
          silverOwnerName: "M/s Yogeshkumar and Brothers",
          logoUrl: "/logo.png",
          ownerName: "",
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchShopSettings();
  }, []);

  useEffect(() => {
    if (!editingId) {
      setFormData(emptyForm);
    }
  }, [editingId]);

  const handleDownloadStockPDF = async (
    type?: ReportType,
    dateRange?: { start: string; end: string },
    dateRangeType?: DateRangeProductType
  ) => {
    if (!products || products.length === 0) {
      showToast.error("No products available to generate report");
      return;
    }

    // If type is not specified, show dialog
    if (type === undefined) {
      setShowReportTypeDialog(true);
      return;
    }

    // If date range is requested but not provided, show date range dialog
    if (type === "date-range" && !dateRange) {
      setShowDateRangeDialog(true);
      return;
    }

    try {
      const loadingMessage =
        type === "date-range"
          ? `Generating ${
              dateRangeType === "both"
                ? "All"
                : dateRangeType === "gold"
                ? "Gold"
                : "Silver"
            } Date Range report PDF, please wait...`
          : `Generating ${
              type === "all"
                ? "Stock"
                : type.charAt(0).toUpperCase() + type.slice(1)
            } report PDF, please wait...`;

      showToast.loading(loadingMessage);

      // Filter products based on selected type
      let filteredProducts = products;
      let reportLabel = "";

      if (type === "gold" || type === "silver") {
        filteredProducts = products.filter((p) => p.productType === type);
        reportLabel = type === "gold" ? "Gold" : "Silver";
      } else if (type === "date-range" && dateRange) {
        // Filter by date range - cast products to include createdAt
        const productsWithDates = products as ProductWithDate[];

        // First filter by date
        let dateFilteredProducts = productsWithDates.filter((product) => {
          // Use createdAt if available, otherwise use current date
          const productDate = new Date(product.createdAt || new Date());
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include entire end day

          return productDate >= startDate && productDate <= endDate;
        });

        // Then filter by product type if specified
        if (dateRangeType === "gold") {
          dateFilteredProducts = dateFilteredProducts.filter(
            (p) => p.productType === "gold"
          );
        } else if (dateRangeType === "silver") {
          dateFilteredProducts = dateFilteredProducts.filter(
            (p) => p.productType === "silver"
          );
        }
        // If "both", keep all filtered products

        filteredProducts = dateFilteredProducts;

        const typeLabel =
          dateRangeType === "both"
            ? "All"
            : dateRangeType === "gold"
            ? "Gold"
            : "Silver";
        reportLabel = `${typeLabel} Date Range ${new Date(
          dateRange.start
        ).toLocaleDateString()} - ${new Date(
          dateRange.end
        ).toLocaleDateString()}`;
      }
      // For "all" type, use all products

      if (filteredProducts.length === 0) {
        showToast.error(`No products available to generate ${type} report`);
        return;
      }

      const mappedProducts: StockProduct[] = filteredProducts.map(
        (p, index) => ({
          srNo: index + 1,
          productNo: p.productNo,
          name: p.name,
          productType: p.productType,
          quantity: p.quantity || 0,
          hsnCode: p.hsnCode || "",
          weight: p.weight || 0,
          weightUnit: p.weightUnit || "g",
        })
      );

      // Determine details based on report type
      let ownerName = "";
      let gstNumber = "";
      let panNumber = "";
      let shopTitle = shopSettings?.shopName || "SuvarnaDesk Jewellery";
      let reportType: "gold" | "silver" | "all" = "all"; // Default to all

      if (
        type === "gold" ||
        (type === "date-range" && dateRangeType === "gold")
      ) {
        ownerName = shopSettings?.goldOwnerName || "Jay Krushna Haribhai Soni";
        gstNumber = shopSettings?.goldGstNumber || "";
        panNumber = shopSettings?.goldPanNumber || "";
        shopTitle = ownerName;
        reportType = "gold";
      } else if (
        type === "silver" ||
        (type === "date-range" && dateRangeType === "silver")
      ) {
        ownerName =
          shopSettings?.silverOwnerName || "M/s Yogeshkumar and Brothers";
        gstNumber = shopSettings?.silverGstNumber || "";
        panNumber = shopSettings?.silverPanNumber || "";
        shopTitle = ownerName;
        reportType = "silver";
      } else {
        // For "all" or "both" type
        ownerName = shopSettings?.ownerName || "SuvarnaDesk Jewellery";
        shopTitle = shopSettings?.shopName || "SuvarnaDesk Jewellery";
        reportType = "all";
      }

      const doc = (
        <StockReportPDF
          data={{
            reportDateTime: new Date().toISOString(),
            shopName: shopTitle,
            shopAddress:
              shopSettings?.address ||
              "near ashok stambh, choksi bazar anand 388001",
            logoUrl: shopSettings?.logoUrl || "/logo.png",
            products: mappedProducts,
            reportType: reportType,
            ownerName: ownerName,
            gstNumber: gstNumber,
            panNumber: panNumber,
            goldGstNumber: shopSettings?.goldGstNumber || "",
            silverGstNumber: shopSettings?.silverGstNumber || "",
            goldPanNumber: shopSettings?.goldPanNumber || "",
            silverPanNumber: shopSettings?.silverPanNumber || "",
            goldOwnerName:
              shopSettings?.goldOwnerName || "Jay Krushna Haribhai Soni",
            silverOwnerName:
              shopSettings?.silverOwnerName || "M/s Yogeshkumar and Brothers",
          }}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      let fileName = "";
      if (type === "date-range" && dateRange) {
        const start = new Date(dateRange.start).toISOString().slice(0, 10);
        const end = new Date(dateRange.end).toISOString().slice(0, 10);
        const typePrefix =
          dateRangeType === "both"
            ? "All"
            : dateRangeType === "gold"
            ? "Gold"
            : "Silver";
        fileName = `${typePrefix}_Stock_Report_${start}_to_${end}.pdf`;
      } else {
        const typeLabel =
          type === "all"
            ? "Stock"
            : type.charAt(0).toUpperCase() + type.slice(1);
        fileName = `${typeLabel}_Report_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const successMessage =
        type === "date-range"
          ? `${
              dateRangeType === "both"
                ? "All"
                : dateRangeType === "gold"
                ? "Gold"
                : "Silver"
            } Date Range report PDF downloaded successfully!`
          : `${reportLabel} report PDF downloaded successfully!`;

      showToast.success(successMessage);

      // Reset dialogs
      setShowReportTypeDialog(false);
      setShowDateRangeDialog(false);
      setSelectedReportType("all");
      setDateRangeStart("");
      setDateRangeEnd("");
      setDateRangeProductType("both");
    } catch (error) {
      console.error("Stock PDF generation error:", error);
      showToast.error("Failed to generate report PDF. Please try again.");
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product._id || null);
    setFormData(product);
    setIsFormOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "weight" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productNo.trim() || !formData.name.trim()) {
      showToast.error("Product No and Name are required");
      return;
    }

    if (editingId) {
      updateProduct.mutate(
        { id: editingId, payload: formData },
        {
          onSuccess: () => {
            showToast.success("Product updated successfully");
            setEditingId(null);
            setIsFormOpen(false);
          },
          onError: () => showToast.error("Failed to update product"),
        }
      );
    } else {
      createProduct.mutate(formData, {
        onSuccess: () => {
          showToast.success("Product added successfully");
          setFormData(emptyForm);
          setIsFormOpen(false);
        },
        onError: (error: any) =>
          showToast.error(
            error.response?.data?.error || "Failed to add product"
          ),
      });
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData(emptyForm);
    showToast.success("Form reset successfully");
  };

  const handleConfirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = (permanent: boolean) => {
    if (!permanent || !deleteConfirmId) {
      setDeleteConfirmId(null);
      return;
    }

    deleteProduct.mutate(deleteConfirmId, {
      onSuccess: () => {
        showToast.success("Product deleted");
        setDeleteConfirmId(null);
      },
      onError: () => {
        showToast.error("Failed to delete product");
        setDeleteConfirmId(null);
      },
    });
  };

  const totalQuantity = (products || []).reduce(
    (sum, p) => sum + (p.quantity || 0),
    0
  );

  const toGrams = (weight: number, unit: string) => {
    switch (unit) {
      case "kg":
        return weight * 1000;
      case "mg":
        return weight / 1000;
      case "tola":
        return weight * 11.66;
      default:
        return weight;
    }
  };

  const totalWeight = (products || []).reduce(
    (sum, p) => sum + toGrams(p.weight || 0, p.weightUnit || "g"),
    0
  );

  // Calculate weight by product type
  const goldWeight = (products || []).reduce(
    (sum, p) =>
      p.productType === "gold"
        ? sum + toGrams(p.weight || 0, p.weightUnit || "g")
        : sum,
    0
  );

  const silverWeight = (products || []).reduce(
    (sum, p) =>
      p.productType === "silver"
        ? sum + toGrams(p.weight || 0, p.weightUnit || "g")
        : sum,
    0
  );

  // Count products by type
  const goldCount = (products || []).filter(
    (p) => p.productType === "gold"
  ).length;
  const silverCount = (products || []).filter(
    (p) => p.productType === "silver"
  ).length;

  const handleGenerateDateRangeReport = () => {
    if (!dateRangeStart || !dateRangeEnd) {
      showToast.error("Please select both start and end dates");
      return;
    }

    const start = new Date(dateRangeStart);
    const end = new Date(dateRangeEnd);

    if (start > end) {
      showToast.error("Start date cannot be after end date");
      return;
    }

    handleDownloadStockPDF(
      "date-range",
      {
        start: dateRangeStart,
        end: dateRangeEnd,
      },
      dateRangeProductType
    );
  };

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
            <MdInventory className="text-2xl text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Stock</h2>
            <p className="text-gray-600">
              Manage your jewellery product inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-0"
          >
            New Product Form
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownloadStockPDF()}
            disabled={isLoadingSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-0 disabled:opacity-50"
          >
            <MdPictureAsPdf className="text-lg" />
            {isLoadingSettings ? "Loading..." : "Download Stock PDF"}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form + Table Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Form only when open */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {editingId ? "Edit Product" : "Add Product"}
                  </h3>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="px-3 py-2 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-0"
                    >
                      Reset Form
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingId(null);
                      }}
                      className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Product No *
                    </label>
                    <input
                      type="text"
                      name="productNo"
                      value={formData.productNo}
                      onChange={handleChange}
                      placeholder="e.g., PRD-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Diamond Necklace"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Product Type *
                    </label>
                    <div className="w-full">
                      <CustomDropdown
                        options={[
                          { value: "gold", label: "Gold" },
                          { value: "silver", label: "Silver" },
                        ]}
                        value={formData.productType}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            productType: value as "gold" | "silver",
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <input
                      title="Quantity"
                      type="number"
                      name="quantity"
                      min={0}
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      name="hsnCode"
                      value={formData.hsnCode}
                      onChange={handleChange}
                      placeholder="e.g., 7113"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="weight"
                        min={0}
                        step="0.01"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="10.50"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="w-28">
                        <CustomDropdown
                          options={[
                            { value: "g", label: "g" },
                            { value: "mg", label: "mg" },
                            { value: "kg", label: "kg" },
                            { value: "tola", label: "Tola" },
                          ]}
                          value={formData.weightUnit}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              weightUnit: value as "g" | "mg" | "kg" | "tola",
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={
                        createProduct.isPending || updateProduct.isPending
                      }
                      className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-0"
                    >
                      <MdAdd className="text-lg" />
                      {editingId ? "Update Product" : "Save Product"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Products List
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-left text-gray-700">
                      Product No
                    </th>
                    <th className="px-4 py-3 font-semibold text-left text-gray-700">
                      Product Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-left text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-center text-gray-700">
                      Qty
                    </th>
                    <th className="px-4 py-3 font-semibold text-left text-gray-700">
                      HSN Code
                    </th>
                    <th className="px-4 py-3 font-semibold text-right text-gray-700">
                      Weight
                    </th>
                    <th className="px-4 py-3 font-semibold text-center text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        Loading products...
                      </td>
                    </tr>
                  ) : products && products.length > 0 ? (
                    products.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-700">
                          {p.productNo}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.name}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              p.productType === "gold"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {p.productType.charAt(0).toUpperCase() +
                              p.productType.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {p.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.hsnCode}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {p.weight.toFixed(2)} {p.weightUnit}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              aria-label={`Edit ${p.name}`}
                              title="Edit product"
                              className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-0"
                            >
                              <MdEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() =>
                                p._id && handleConfirmDelete(p._id)
                              }
                              aria-label={`Delete ${p.name}`}
                              title="Delete product"
                              className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 focus:outline-none focus:ring-0"
                            >
                              <MdDelete className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No products found. Use the form button above to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Summary card */}
        <div className="lg:col-span-1">
          <div className="sticky p-6 border border-gray-200 top-20 bg-gray-50 rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Stock Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-semibold text-gray-900">
                  {products?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gold Products:</span>
                <span className="font-semibold text-gray-900">{goldCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Silver Products:</span>
                <span className="font-semibold text-gray-900">
                  {silverCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="font-semibold text-gray-900">
                  {totalQuantity}
                </span>
              </div>
              <div className="pt-2 border-t-2 border-gray-300">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    Gold Weight:
                  </span>
                  <span className="font-semibold text-yellow-600">
                    {goldWeight.toFixed(2)} g
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    Silver Weight:
                  </span>
                  <span className="font-semibold text-gray-500">
                    {silverWeight.toFixed(2)} g
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">
                    Total Weight:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {totalWeight.toFixed(2)} g
                  </span>
                </div>
              </div>

              {/* Date Range Report Button */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDateRangeDialog(true)}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-0"
                >
                  <MdCalendarToday className="text-lg" />
                  Generate Date Range Report
                </motion.button>
              </div>

              <div className="p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50">
                <p className="text-xs text-blue-700">
                  <strong>Editing:</strong>{" "}
                  {editingId ? "Update existing product" : "Create new product"}
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Product type helps categorize and value
                  your inventory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Selection Dialog */}
      <AnimatePresence>
        {showReportTypeDialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-800">
                  Select Report Type
                </h4>
                <button
                  onClick={() => {
                    setShowReportTypeDialog(false);
                    setSelectedReportType("all");
                  }}
                  className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="mb-6 text-sm text-gray-600">
                Choose the type of stock report you want to download:
              </p>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedReportType("all");
                    handleDownloadStockPDF("all");
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedReportType === "all"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <MdInventory className="text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">
                        Complete Stock Report
                      </h5>
                      <p className="text-xs text-gray-600">
                        All products (Gold + Silver)
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Includes both GST & PAN numbers
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedReportType("gold");
                    handleDownloadStockPDF("gold");
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedReportType === "gold"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <MdInventory className="text-yellow-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">
                        Gold Products Only
                      </h5>
                      <p className="text-xs text-gray-600">
                        With Gold GSTIN and PAN details
                      </p>
                      <p className="mt-1 text-xs text-yellow-600">
                        {shopSettings?.goldOwnerName ||
                          "Jay Krushna Haribhai Soni"}
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedReportType("silver");
                    handleDownloadStockPDF("silver");
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedReportType === "silver"
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <MdInventory className="text-gray-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">
                        Silver Products Only
                      </h5>
                      <p className="text-xs text-gray-600">
                        With Silver GSTIN and PAN details
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {shopSettings?.silverOwnerName ||
                          "M/s Yogeshkumar and Brothers"}
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="p-3 mb-4 rounded-lg bg-blue-50">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Owner names, GST and PAN numbers are
                  fetched from Shop Settings.
                  {(!shopSettings?.goldGstNumber ||
                    !shopSettings?.goldPanNumber ||
                    !shopSettings?.silverGstNumber ||
                    !shopSettings?.silverPanNumber) &&
                    " Please set them in Settings first for proper invoices."}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowReportTypeDialog(false);
                    setSelectedReportType("all");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Range Selection Dialog */}
      <AnimatePresence>
        {showDateRangeDialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-800">
                  Generate Date Range Report
                </h4>
                <button
                  onClick={() => {
                    setShowDateRangeDialog(false);
                    setDateRangeStart("");
                    setDateRangeEnd("");
                    setDateRangeProductType("both");
                  }}
                  className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="mb-6 text-sm text-gray-600">
                Select a date range and product type to generate a customized
                stock report.
              </p>

              <div className="mb-6 space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <DateDropdown
                    value={dateRangeStart}
                    onChange={setDateRangeStart}
                    placeholder="Select start date"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    End Date *
                  </label>
                  <DateDropdown
                    value={dateRangeEnd}
                    onChange={setDateRangeEnd}
                    placeholder="Select end date"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Product Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDateRangeProductType("gold")}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-2 ${
                        dateRangeProductType === "gold"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <MdDiamond
                        className={`text-xl ${
                          dateRangeProductType === "gold"
                            ? "text-yellow-600"
                            : "text-yellow-400"
                        }`}
                      />
                      <span className="text-xs font-medium">Gold Only</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDateRangeProductType("silver")}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-2 ${
                        dateRangeProductType === "silver"
                          ? "border-gray-500 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <MdOutlineDiamond
                        className={`text-xl ${
                          dateRangeProductType === "silver"
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs font-medium">Silver Only</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDateRangeProductType("both")}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-2 ${
                        dateRangeProductType === "both"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <MdAllInbox
                        className={`text-xl ${
                          dateRangeProductType === "both"
                            ? "text-green-600"
                            : "text-green-400"
                        }`}
                      />
                      <span className="text-xs font-medium">Both (All)</span>
                    </motion.button>
                  </div>
                </div>

                {dateRangeStart && dateRangeEnd && (
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-800">
                      Report Period:{" "}
                      {new Date(dateRangeStart).toLocaleDateString()} to{" "}
                      {new Date(dateRangeEnd).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      Includes{" "}
                      {dateRangeProductType === "both"
                        ? "all products (Gold + Silver)"
                        : dateRangeProductType === "gold"
                        ? "Gold products only"
                        : "Silver products only"}{" "}
                      added/updated within this date range.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 mb-4 rounded-lg bg-blue-50">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong>{" "}
                  {dateRangeProductType === "both"
                    ? "All products within the date range will be included. Gold products will use Gold GSTIN/PAN, Silver products will use Silver GSTIN/PAN."
                    : dateRangeProductType === "gold"
                    ? "Only Gold products within the date range will be included. Report will use Gold GSTIN and PAN details."
                    : "Only Silver products within the date range will be included. Report will use Silver GSTIN and PAN details."}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDateRangeDialog(false);
                    setDateRangeStart("");
                    setDateRangeEnd("");
                    setDateRangeProductType("both");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateDateRangeReport}
                  disabled={!dateRangeStart || !dateRangeEnd}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-sm p-5 bg-white shadow-lg rounded-xl"
            >
              <h4 className="mb-2 text-lg font-semibold text-gray-800">
                Delete product?
              </h4>
              <p className="mb-4 text-sm text-gray-600">
                Do you want to delete this product permanently? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleDelete(false)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(true)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stock;
