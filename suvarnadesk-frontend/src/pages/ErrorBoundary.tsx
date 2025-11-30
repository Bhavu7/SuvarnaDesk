import React from "react";
import { useNavigate } from "react-router-dom";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Error Fallback Component
const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse opacity-30"></div>
            <div className="relative text-6xl">🚨</div>
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Something Went Wrong
        </h1>
        <p className="mb-6 text-gray-600">
          We encountered an unexpected error. Our team has been notified and is
          working to fix it.
        </p>

        {error && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Technical Details
            </summary>
            <pre className="p-3 mt-2 overflow-auto text-xs text-gray-700 bg-gray-100 rounded-lg">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
