import React from "react";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-10">
    <div className="w-10 h-10 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;
