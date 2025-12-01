// pages/AdminManagement.tsx - Fixed version
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdDelete,
  MdAdd,
  MdLockReset,
  MdEdit,
  MdWarning,
  MdSupervisorAccount,
  MdAdminPanelSettings,
  MdBusiness,
  MdAttachMoney,
} from "react-icons/md";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface AdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
}

const AdminManagement: React.FC = () => {
  const {
    user,
    getAllAdmins,
    createAdmin,
    deleteAdmin,
    adminStats,
    isSuperAdmin,
  } = useAuth();

  const [admins, setAdmins] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AdminFormData>();

  const password = watch("password");

  // Load admins when component mounts or isSuperAdmin changes
  useEffect(() => {
    const loadAdmins = async () => {
      if (isSuperAdmin) {
        try {
          setLoading(true);
          const adminList = await getAllAdmins();
          setAdmins(adminList);
        } catch (error) {
          console.error("Failed to load admins:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAdmins();
  }, [isSuperAdmin]); // Removed getAllAdmins from dependencies

  const onSubmit = async (data: AdminFormData) => {
    try {
      await createAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        role: data.role,
      });

      reset();
      setShowAddForm(false);
      // Reload admins after creation
      const adminList = await getAllAdmins();
      setAdmins(adminList);
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${adminName}"?`)) {
      return;
    }

    if (adminStats?.adminCount && adminStats.adminCount <= 1) {
      toast.error("Cannot delete the last admin");
      return;
    }

    try {
      await deleteAdmin(adminId);
      // Reload admins after deletion
      const adminList = await getAllAdmins();
      setAdmins(adminList);
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "manager":
        return "bg-green-100 text-green-800";
      case "accountant":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <MdAdminPanelSettings className="text-xl" />;
      case "admin":
        return <MdSupervisorAccount className="text-xl" />;
      case "manager":
        return <MdBusiness className="text-xl" />;
      case "accountant":
        return <MdAttachMoney className="text-xl" />;
      default:
        return <MdPerson className="text-xl" />;
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full">
            <MdWarning className="text-3xl text-red-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="text-gray-600">Only Super Admin can access this page</p>
          <p className="mt-2 text-sm text-gray-500">
            Current role: {user?.role ? formatRole(user.role) : "Admin"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Management
            </h1>
            <p className="text-gray-600">
              Manage up to {adminStats?.maxLimit || 4} admin users
            </p>
          </div>

          <div className="flex items-center gap-4">
            {adminStats && (
              <div className="px-4 py-2 text-sm rounded-lg bg-blue-50">
                <span className="font-semibold text-blue-700">
                  {adminStats.adminCount}/{adminStats.maxLimit}
                </span>
                <span className="ml-2 text-gray-600">admins</span>
              </div>
            )}

            {adminStats?.canAddMore && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <MdAdd />
                Add Admin
              </motion.button>
            )}
          </div>
        </div>

        {adminStats && !adminStats.canAddMore && (
          <div className="p-4 mt-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-3">
              <MdWarning className="text-xl text-yellow-600" />
              <p className="text-yellow-800">
                Maximum limit of {adminStats.maxLimit} admins reached. Delete an
                existing admin to add a new one.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Admin Form */}
      <AnimatePresence>
        {showAddForm && adminStats?.canAddMore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Add New Admin
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register("name", {
                        required: "Name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="admin@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <input
                      type="password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Minimum 6 characters"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      {...register("confirmPassword", {
                        required: "Please confirm password",
                        validate: (value: string) =>
                          value === password || "Passwords do not match",
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Re-enter password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Role *
                    </label>
                    <select
                      {...register("role", { required: "Role is required" })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.role ? "border-red-500" : "border-gray-300"
                      }`}
                      defaultValue="admin"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="accountant">Accountant</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setShowAddForm(false);
                    }}
                    className="px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin List */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Admin Users ({admins.length})
            </h2>
            {adminStats && (
              <div className="text-sm text-gray-600">
                Available slots: {adminStats.availableSlots}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <MdPerson className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-600">No admins found</p>
            <p className="mt-1 text-sm text-gray-500">
              Add your first admin user
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Member Since
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                          <span className="font-semibold text-white">
                            {admin.name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {admin.name}
                            {admin._id === user?._id && (
                              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded">
                                You
                              </span>
                            )}
                            {admin.role === "super_admin" && (
                              <span className="px-2 py-1 ml-2 text-xs text-purple-800 bg-purple-100 rounded">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {admin._id?.substring(0, 8) || "N/A"}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-2 mb-1">
                          <MdEmail className="text-gray-400" />
                          {admin.email}
                        </div>
                        {admin.phone && (
                          <div className="flex items-center gap-2">
                            <MdPhone className="text-gray-400" />
                            {admin.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(admin.role)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            admin.role
                          )}`}
                        >
                          {formatRole(admin.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(admin.memberSince || admin.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {admin._id !== user?._id &&
                          admin.role !== "super_admin" &&
                          admins.length > 1 && (
                            <button
                              onClick={() =>
                                handleDelete(admin._id, admin.name)
                              }
                              className="p-2 text-gray-600 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <MdDelete className="text-lg" />
                            </button>
                          )}
                        <button
                          onClick={() => toast("Edit feature coming soon")}
                          className="p-2 text-gray-600 transition-colors rounded-lg hover:text-green-600 hover:bg-green-50"
                          title="Edit"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() =>
                            toast("Reset password feature coming soon")
                          }
                          className="p-2 text-gray-600 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50"
                          title="Reset Password"
                        >
                          <MdLockReset className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
        <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
          <h3 className="mb-3 font-semibold text-blue-800">
            Admin Management Guidelines
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <span className="inline-block w-2 h-2 mt-2 bg-blue-500 rounded-full"></span>
              <span>
                Maximum of {adminStats?.maxLimit || 4} admin users allowed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-block w-2 h-2 mt-2 bg-blue-500 rounded-full"></span>
              <span>At least 1 admin must remain active at all times</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-block w-2 h-2 mt-2 bg-blue-500 rounded-full"></span>
              <span>Only Super Admin can create/delete other admins</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-block w-2 h-2 mt-2 bg-blue-500 rounded-full"></span>
              <span>
                Super Admin has full system access and admin management rights
              </span>
            </li>
          </ul>
        </div>

        <div className="p-6 border border-green-200 bg-green-50 rounded-xl">
          <h3 className="mb-3 font-semibold text-green-800">
            Role Permissions
          </h3>
          <ul className="space-y-3 text-green-700">
            <li>
              <span className="font-medium">Super Admin:</span>
              <span className="ml-2">
                Full system access + admin management
              </span>
            </li>
            <li>
              <span className="font-medium">Admin:</span>
              <span className="ml-2">
                Full access to all features except admin management
              </span>
            </li>
            <li>
              <span className="font-medium">Manager:</span>
              <span className="ml-2">
                Can manage customers, inventory, and invoices
              </span>
            </li>
            <li>
              <span className="font-medium">Accountant:</span>
              <span className="ml-2">
                Can manage invoices, payments, and reports
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
