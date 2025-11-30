import React from "react";
import { MdErrorOutline, MdHome, MdArrowBack } from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      <div className="w-full max-w-md text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
            <MdErrorOutline className="relative text-[6rem] text-red-500 z-10" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Page Not Found
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            Oops! The page you're looking for seems to have wandered off. It
            might have been moved, deleted, or you entered an incorrect URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-gray-700 transition-colors bg-white border border-gray-300 shadow-sm rounded-xl hover:bg-gray-50"
            >
              <MdArrowBack className="text-lg" />
              Go Back
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700"
            >
              <MdHome className="text-lg" />
              Go Home
            </motion.button>
          </div>

          {/* Additional Help */}
          <div className="p-4 mt-8 border border-yellow-200 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Need help?</strong> If you believe this is an error,
              please contact support or check the URL for typos.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;
