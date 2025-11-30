import React from "react";
import { MdRefresh, MdHome, MdReportProblem } from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

const PageError: React.FC<PageErrorProps> = ({
  message = "Failed to load page content",
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center min-h-64"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="mb-4"
      >
        <MdReportProblem className="text-5xl text-amber-500" />
      </motion.div>

      <h3 className="mb-2 text-xl font-semibold text-gray-800">
        Unable to Load Content
      </h3>

      <p className="max-w-md mb-6 text-gray-600">{message}</p>

      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <MdRefresh className="text-lg" />
            Try Again
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
        >
          <MdHome className="text-lg" />
          Go to Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PageError;
