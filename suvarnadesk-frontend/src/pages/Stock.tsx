import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdInventory, MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  Product,
} from "../hooks/useStock";
import { showToast } from "../components/CustomToast"; // same toast you use elsewhere

const emptyForm: Product = {
  productNo: "",
  name: "",
  quantity: 0,
  hsnCode: "",
  weight: 0,
};

const Stock: React.FC = () => {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!isFormOpen) {
      setEditingId(null);
      setFormData(emptyForm);
    }
  }, [isFormOpen]);

  const handleOpenAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product._id || null);
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
            setIsFormOpen(false);
          },
          onError: () => showToast.error("Failed to update product"),
        }
      );
    } else {
      createProduct.mutate(formData, {
        onSuccess: () => {
          showToast.success("Product added successfully");
          setIsFormOpen(false);
        },
        onError: (error: any) =>
          showToast.error(
            error.response?.data?.error || "Failed to add product"
          ),
      });
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
        >
          <MdAdd className="text-lg" />
          Add Product
        </motion.button>
      </div>

      {/* Form (slide-down panel) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              <button
              title="Close Form"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-500 rounded hover:bg-gray-100"
              >
                <MdClose />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Product No *
                </label>
                <input
                  name="productNo"
                  type="text"
                  value={formData.productNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="PRD-001"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Diamond Necklace"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                title="Quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  HSN Code
                </label>
                <input
                  name="hsnCode"
                  type="text"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="7113"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Weight (grams)
                </label>
                <input
                  name="weight"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10.50"
                />
              </div>

              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingId ? "Update Product" : "Save Product"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 font-semibold text-left text-gray-700">
                  Product No
                </th>
                <th className="px-4 py-2 font-semibold text-left text-gray-700">
                  Product Name
                </th>
                <th className="px-4 py-2 font-semibold text-right text-gray-700">
                  Quantity
                </th>
                <th className="px-4 py-2 font-semibold text-left text-gray-700">
                  HSN Code
                </th>
                <th className="px-4 py-2 font-semibold text-right text-gray-700">
                  Weight (g)
                </th>
                <th className="px-4 py-2 font-semibold text-center text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((p) => (
                  <tr
                    key={p._id}
                    className="transition-colors border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{p.productNo}</td>
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2 text-right">{p.quantity}</td>
                    <td className="px-4 py-2">{p.hsnCode}</td>
                    <td className="px-4 py-2 text-right">
                      {p.weight.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-blue-600 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(p._id!)}
                          className="p-1.5 text-red-600 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No products found. Click “Add Product” to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

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
