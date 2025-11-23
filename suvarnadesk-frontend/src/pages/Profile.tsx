import React from "react";
import { MdPerson } from "react-icons/md";
import { motion } from "framer-motion";

const Profile = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="flex items-center gap-3 mb-6">
      <MdPerson className="text-3xl text-green-500" />
      <h2 className="text-2xl font-bold">Profile</h2>
    </div>
    <div className="max-w-md p-6 mx-auto bg-white rounded shadow">
      <div className="mb-2">
        <strong>Name:</strong> Admin
      </div>
      <div className="mb-2">
        <strong>Email:</strong> admin@example.com
      </div>
      <div className="mb-2">
        <strong>Phone:</strong> 1234567890
      </div>
      <button className="px-4 py-2 mt-6 text-white transition bg-blue-600 rounded hover:bg-blue-700">
        Edit Profile
      </button>
    </div>
  </motion.div>
);

export default Profile;
