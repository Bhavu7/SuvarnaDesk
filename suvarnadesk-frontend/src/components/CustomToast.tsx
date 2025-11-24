import React from "react";
import { toast, ToastOptions } from "react-hot-toast";

const toastConfig: ToastOptions = {
  position: "top-right",
  duration: 4000,
  style: {
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    padding: "12px 20px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
    maxWidth: "400px",
    wordBreak: "break-word",
  },
};

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: "rgba(16, 185, 129, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(16, 185, 129, 0.4)",
        color: "#ffffff",
      },
      iconTheme: {
        primary: "#10B981",
        secondary: "#fff",
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: "rgba(239, 68, 68, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(239, 68, 68, 0.4)",
        color: "#ffffff",
      },
      iconTheme: {
        primary: "#EF4444",
        secondary: "#fff",
      },
    });
  },
  loading: (message: string) => {
    toast.loading(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: "rgba(59, 130, 246, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(59, 130, 246, 0.4)",
        color: "#ffffff",
      },
    });
  },
  default: (message: string) => {
    toast(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: "#1f2937",
      },
    });
  },
};

// Toast container component for proper positioning
export const ToastContainer: React.FC = () => {
  return (
    <div className="toast-container">
      {/* This will be rendered by react-hot-toast */}
    </div>
  );
};
