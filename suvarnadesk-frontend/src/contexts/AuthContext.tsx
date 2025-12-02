// contexts/AuthContext.tsx - Fixed version
import React, { createContext, useContext, useState, useEffect } from "react";
import { useLogin } from "../hooks/useAuth";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

// Update Admin interface to match backend
interface Admin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  memberSince?: string;
  lastLogin?: string;
  createdAt?: string;
  isActive?: boolean;
}

interface AdminStats {
  adminCount: number;
  superAdminCount: number;
  maxLimit: number;
  canAddMore: boolean;
  availableSlots: number;
}

interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: Admin | null;
  isLoading: boolean;

  // Admin management functions
  getAllAdmins: () => Promise<Admin[]>;
  createAdmin: (adminData: CreateAdminData) => Promise<Admin>;
  updateAdmin: (id: string, adminData: Partial<Admin>) => Promise<Admin>;
  resetPassword: (adminId: string, newPassword: string) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;

  // Stats and permissions
  adminStats: AdminStats | null;
  loadAdminStats: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const loginMutation = useLogin();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          // Verify token is still valid with backend
          const response = await apiClient.get("/admin/verify");
          setIsAuthenticated(true);
          setUser(response.data.admin);
          setIsSuperAdmin(response.data.admin.role === "super_admin");

          // Load admin stats
          await loadAdminStats();
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
          setIsSuperAdmin(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loadAdminStats = async () => {
    try {
      const response = await apiClient.get("/admin/stats");
      setAdminStats(response.data);
    } catch (error) {
      console.error("Failed to load admin stats:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.admin));
      setIsAuthenticated(true);
      setUser(result.admin);
      setIsSuperAdmin(result.admin.role === "super_admin");

      // Load admin stats after login
      await loadAdminStats();

      toast.success("Login successful!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.toast?.message || "Login failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setIsSuperAdmin(false);
    setAdminStats(null);
    toast.success("Logged out successfully");
  };

  const getAllAdmins = async (): Promise<Admin[]> => {
    try {
      const response = await apiClient.get("/admin/all");
      return response.data.admins;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.toast?.message || "Failed to fetch admins";
      toast.error(errorMessage);
      throw error;
    }
  };

  const createAdmin = async (adminData: CreateAdminData): Promise<Admin> => {
    try {
      const response = await apiClient.post("/admin/create", adminData);
      await loadAdminStats();
      toast.success(
        response.data.toast?.message || "Admin created successfully!"
      );
      return response.data.admin;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.toast?.message || "Failed to create admin";
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateAdmin = async (
    id: string,
    adminData: Partial<Admin>
  ): Promise<Admin> => {
    try {
      const response = await apiClient.put(`/admin/${id}`, adminData);

      // Update current user if updating self
      if (user?._id === id) {
        const updatedUser = { ...user, ...adminData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsSuperAdmin(updatedUser.role === "super_admin");
      }

      toast.success(
        response.data.toast?.message || "Admin updated successfully!"
      );
      return response.data.admin;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.toast?.message || "Failed to update admin";
      toast.error(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (adminId: string, newPassword: string) => {
    try {
      const response = await apiClient.patch(
        `/admin/${adminId}/reset-password`,
        {
          newPassword,
        }
      );
      toast.success(
        response.data.toast?.message || "Password reset successfully!"
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.toast?.message || "Failed to reset password";
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      const response = await apiClient.delete(`/admin/${id}`);
      await loadAdminStats();

      // If current user deleted themselves, logout
      if (user?._id === id) {
        logout();
      } else {
        toast.success(
          response.data.toast?.message || "Admin deleted successfully!"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.toast?.message || "Failed to delete admin";
      toast.error(errorMessage);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await apiClient.patch("/admin/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success(
        response.data.toast?.message || "Password changed successfully!"
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.toast?.message || "Failed to change password";
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        isLoading,
        getAllAdmins,
        createAdmin,
        updateAdmin,
        resetPassword,
        deleteAdmin,
        changePassword,
        adminStats,
        loadAdminStats,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
