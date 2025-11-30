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

// Material Icons as SVG components
const ToastIcons = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  loading: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ),
  default: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
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
      icon: ToastIcons.success,
      iconTheme: {
        primary: "#ffffff",
        secondary: "#10B981",
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
      icon: ToastIcons.error,
      iconTheme: {
        primary: "#ffffff",
        secondary: "#EF4444",
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
      icon: ToastIcons.loading,
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
      icon: ToastIcons.default,
    });
  },
  info: (message: string) => {
    toast(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: "rgba(59, 130, 246, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(59, 130, 246, 0.4)",
        color: "#ffffff",
      },
      icon: ToastIcons.info,
      iconTheme: {
        primary: "#ffffff",
        secondary: "#3B82F6",
      },
    });
  },
  warning: (message: string) => {
    toast(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: "rgba(245, 158, 11, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(245, 158, 11, 0.4)",
        color: "#ffffff",
      },
      icon: ToastIcons.warning,
      iconTheme: {
        primary: "#ffffff",
        secondary: "#F59E0B",
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
