// pages/AdminManagement.tsx - Complete version with all features
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
  MdSave,
  MdCancel,
  MdWarning,
  MdSupervisorAccount,
  MdAdminPanelSettings,
  MdBusiness,
  MdAttachMoney,
  MdVisibility,
  MdVisibilityOff,
  MdKey,
  MdInfo,
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

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

const AdminManagement: React.FC = () => {
  const {
    user,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    resetPassword,
    deleteAdmin,
    adminStats,
    isSuperAdmin,
  } = useAuth();

  const [admins, setAdmins] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resettingPasswordId, setResettingPasswordId] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: "",
    email: "",
    phone: "",
    role: "admin",
  });
  const [resetForm, setResetForm] = useState<ResetPasswordData>({
    newPassword: "",
    confirmPassword: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetAddForm,
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
          toast.error("Failed to load admins");
        } finally {
          setLoading(false);
        }
      }
    };

    loadAdmins();
  }, [isSuperAdmin, getAllAdmins]);

  const onSubmit = async (data: AdminFormData) => {
    try {
      await createAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        role: data.role,
      });

      resetAddForm();
      setShowAddForm(false);
      // Reload admins after creation
      const adminList = await getAllAdmins();
      setAdmins(adminList);
      toast.success("Admin created successfully!");
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const handleEditClick = (admin: any) => {
    setEditingId(admin._id);
    setEditForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      role: admin.role,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateAdmin(editingId, editForm);
      setEditingId(null);

      // Reload admins
      const adminList = await getAllAdmins();
      setAdmins(adminList);

      toast.success("Admin updated successfully!");
    } catch (error) {
      toast.error("Failed to update admin");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleResetPasswordClick = (adminId: string, adminEmail: string) => {
    setResettingPasswordId(adminId);
    setResetForm({
      newPassword: "",
      confirmPassword: "",
    });
    toast(`Resetting password for ${adminEmail}`);
  };

  const handleSaveResetPassword = async () => {
    if (!resettingPasswordId) return;

    if (!resetForm.newPassword || !resetForm.confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (resetForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(resettingPasswordId, resetForm.newPassword);
      setResettingPasswordId(null);
      setResetForm({
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const handleCancelResetPassword = () => {
    setResettingPasswordId(null);
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${adminName}"? This action cannot be undone.`
      )
    ) {
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
      toast.success("Admin deleted successfully!");
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "manager":
        return "bg-green-100 text-green-800 border border-green-200";
      case "accountant":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                <MdAdminPanelSettings className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Management
                </h1>
                <p className="text-gray-600">
                  Manage up to {adminStats?.maxLimit || 4} admin users
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {adminStats && (
              <div className="flex items-center gap-3 px-4 py-2 text-sm border border-blue-100 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex flex-col">
                  <span className="font-bold text-blue-700">
                    {adminStats.adminCount}/{adminStats.maxLimit}
                  </span>
                  <span className="text-xs text-gray-500">admins</span>
                </div>
                <div className="w-px h-8 bg-blue-200"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-green-600">
                    {adminStats.availableSlots}
                  </span>
                  <span className="text-xs text-gray-500">available</span>
                </div>
              </div>
            )}

            {adminStats?.canAddMore && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2.5 text-white transition-all bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
              >
                <MdAdd className="text-lg" />
                Add Admin
              </motion.button>
            )}
          </div>
        </div>

        {adminStats && !adminStats.canAddMore && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 mt-4 border border-yellow-300 rounded-lg shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50"
          >
            <MdWarning className="text-2xl text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                Maximum limit reached
              </p>
              <p className="text-sm text-yellow-700">
                You have reached the maximum of {adminStats.maxLimit} admins.
                Delete an existing admin to add a new one.
              </p>
            </div>
          </motion.div>
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
            <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  <MdAdd className="inline mr-2" />
                  Add New Admin
                </h2>
                <button
                title="Cancel"
                  onClick={() => {
                    resetAddForm();
                    setShowAddForm(false);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <MdCancel className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <MdPerson className="text-gray-500" />
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        errors.name
                          ? "border-red-500"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                        <MdWarning /> {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <MdEmail className="text-gray-500" />
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                      placeholder="admin@example.com"
                    />
                    {errors.email && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                        <MdWarning /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <MdKey className="text-gray-500" />
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                          errors.password
                            ? "border-red-500"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                        placeholder="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-blue-600"
                      >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                        <MdWarning /> {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <MdKey className="text-gray-500" />
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      {...register("confirmPassword", {
                        required: "Please confirm password",
                        validate: (value: string) =>
                          value === password || "Passwords do not match",
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                      placeholder="Re-enter password"
                    />
                    {errors.confirmPassword && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                        <MdWarning /> {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <MdPhone className="text-gray-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <MdSupervisorAccount className="text-gray-500" />
                      Role *
                    </label>
                    <select
                      {...register("role", { required: "Role is required" })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        errors.role
                          ? "border-red-500"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                      defaultValue="admin"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="accountant">Accountant</option>
                    </select>
                    {errors.role && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                        <MdWarning /> {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      resetAddForm();
                      setShowAddForm(false);
                    }}
                    className="flex items-center gap-2 px-6 py-3 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <MdCancel />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 text-white transition-colors rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
                  >
                    <MdSave />
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin List */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Admin Users ({admins.length})
              </h2>
              <p className="text-gray-600">Manage your team members</p>
            </div>
            {adminStats && (
              <div className="text-sm">
                <span className="text-gray-600">Available slots: </span>
                <span className="font-bold text-blue-600">
                  {adminStats.availableSlots}
                </span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-12 h-12 mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
              <MdPerson className="text-3xl text-blue-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No admins found
            </h3>
            <p className="mb-6 text-gray-600">
              Add your first admin user to get started
            </p>
            {adminStats?.canAddMore && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <MdAdd className="inline mr-2" />
                Add First Admin
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Member Since
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <React.Fragment key={admin._id}>
                    {/* Reset Password Row */}
                    {resettingPasswordId === admin._id && (
                      <tr className="bg-yellow-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="flex items-center gap-2 font-semibold text-yellow-800">
                                <MdKey /> Reset Password for {admin.name}
                              </h4>
                              <button
                              title="Cancel"
                                onClick={handleCancelResetPassword}
                                className="text-yellow-700 hover:text-yellow-900"
                              >
                                <MdCancel />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="block mb-1 text-sm font-medium text-yellow-800">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  value={resetForm.newPassword}
                                  onChange={(e) =>
                                    setResetForm({
                                      ...resetForm,
                                      newPassword: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                  placeholder="Enter new password"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-sm font-medium text-yellow-800">
                                  Confirm Password
                                </label>
                                <input
                                  type="password"
                                  value={resetForm.confirmPassword}
                                  onChange={(e) =>
                                    setResetForm({
                                      ...resetForm,
                                      confirmPassword: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                  placeholder="Confirm new password"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                              <button
                                onClick={handleCancelResetPassword}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveResetPassword}
                                className="px-4 py-2 text-white rounded bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                              >
                                Reset Password
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Edit Mode Row */}
                    {editingId === admin._id ? (
                      <tr className="bg-blue-50">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Name"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 mb-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="Email"
                            />
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="Phone"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                          title="Select Role"
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm({ ...editForm, role: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="accountant">Accountant</option>
                            {admin.role === "super_admin" && (
                              <option value="super_admin">Super Admin</option>
                            )}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {formatDate(admin.memberSince || admin.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
                              title="Save"
                            >
                              <MdSave className="text-lg" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                              title="Cancel"
                            >
                              <MdCancel className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // Normal View Row
                      <tr className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full shadow-md bg-gradient-to-r from-blue-500 to-purple-600">
                              <span className="text-lg font-bold text-white">
                                {admin.name?.charAt(0).toUpperCase() || "A"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {admin.name}
                                </span>
                                {admin._id === user?._id && (
                                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-full">
                                    You
                                  </span>
                                )}
                                {admin.role === "super_admin" && (
                                  <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 border border-purple-200 rounded-full">
                                    Super Admin
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 font-mono text-xs text-gray-500">
                                ID: {admin._id?.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-800">
                              <MdEmail className="flex-shrink-0 text-gray-500" />
                              <span className="truncate">{admin.email}</span>
                            </div>
                            {admin.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MdPhone className="flex-shrink-0 text-gray-500" />
                                <span>{admin.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getRoleIcon(admin.role)}
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(
                                admin.role
                              )}`}
                            >
                              {formatRole(admin.role)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatDate(admin.memberSince || admin.createdAt)}
                            </div>
                            {admin.lastLogin && (
                              <div className="mt-1 text-xs text-gray-500">
                                Last login: {formatDate(admin.lastLogin)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Edit Button - only for non-super_admin or self */}
                            {(admin._id === user?._id ||
                              admin.role !== "super_admin") && (
                              <button
                                onClick={() => handleEditClick(admin)}
                                className="p-2.5 text-blue-600 transition-all bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-md"
                                title="Edit"
                              >
                                <MdEdit className="text-lg" />
                              </button>
                            )}

                            {/* Reset Password Button - only super admin for others, anyone for self */}
                            {(isSuperAdmin || admin._id === user?._id) && (
                              <button
                                onClick={() =>
                                  handleResetPasswordClick(
                                    admin._id,
                                    admin.email
                                  )
                                }
                                className="p-2.5 text-yellow-600 transition-all bg-yellow-50 rounded-lg hover:bg-yellow-100 hover:shadow-md"
                                title="Reset Password"
                              >
                                <MdLockReset className="text-lg" />
                              </button>
                            )}

                            {/* Delete Button - only super admin for non-super_admin admins, not self, not last admin */}
                            {isSuperAdmin &&
                              admin._id !== user?._id &&
                              admin.role !== "super_admin" &&
                              admins.length > 1 && (
                                <button
                                  onClick={() =>
                                    handleDelete(admin._id, admin.name)
                                  }
                                  className="p-2.5 text-red-600 transition-all bg-red-50 rounded-lg hover:bg-red-100 hover:shadow-md"
                                  title="Delete"
                                >
                                  <MdDelete className="text-lg" />
                                </button>
                              )}

                            {/* Info icon for non-editable accounts */}
                            {admin.role === "super_admin" &&
                              admin._id !== user?._id && (
                                <div
                                  className="p-2.5 text-gray-400"
                                  title="Super Admin accounts cannot be edited or deleted"
                                >
                                  <MdInfo className="text-lg" />
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guidelines and Info */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        <div className="p-6 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdInfo className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">
              Admin Management Guidelines
            </h3>
          </div>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5 bg-blue-100 rounded-full">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <span className="flex-1">
                Maximum of{" "}
                <span className="font-bold">{adminStats?.maxLimit || 4}</span>{" "}
                admin users allowed
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5 bg-blue-100 rounded-full">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <span className="flex-1">
                At least 1 admin must remain active at all times
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5 bg-blue-100 rounded-full">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <span className="flex-1">
                Only Super Admin can create, delete, or reset passwords for
                other admins
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5 bg-blue-100 rounded-full">
                <span className="text-xs font-bold text-blue-600">4</span>
              </div>
              <span className="flex-1">
                All admins have full access to all software features
              </span>
            </li>
          </ul>
        </div>

        <div className="p-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdSupervisorAccount className="text-2xl text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">
              Role Permissions
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-white border border-green-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-800">Super Admin</span>
                <span className="px-2 py-1 text-xs font-bold text-purple-800 bg-purple-100 rounded-full">
                  Full Access
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                Complete system access + admin management rights
              </p>
            </div>
            <div className="p-3 bg-white border border-green-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-800">Admin</span>
                <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">
                  Full Access
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                All features except admin management
              </p>
            </div>
            <div className="p-3 bg-white border border-green-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-800">Manager</span>
                <span className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full">
                  Full Access
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                All customer, inventory, and invoice features
              </p>
            </div>
            <div className="p-3 bg-white border border-green-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-800">Accountant</span>
                <span className="px-2 py-1 text-xs font-bold text-orange-800 bg-orange-100 rounded-full">
                  Full Access
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                All invoice, payment, and report features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current User Info */}
      {user && (
        <div className="p-4 mt-8 border border-gray-300 rounded-lg bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <span className="font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">
                  Logged in as {formatRole(user.role)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Member since</p>
              <p className="font-medium text-gray-900">
                {formatDate(user.memberSince || user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
