import React from "react";
import { MdErrorOutline } from "react-icons/md";
import { motion } from "framer-motion";

const NotFound = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="flex flex-col items-center justify-center h-full mt-32">
      <MdErrorOutline className="mb-2 text-[5rem] text-gray-400" />
      <h1 className="mb-2 text-3xl font-bold">404</h1>
      <p className="text-lg">Page Not Found</p>
    </div>
  </motion.div>
);

export default NotFound;
