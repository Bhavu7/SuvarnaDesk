import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLockOutline, MdPerson } from "react-icons/md";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Replace with actual authentication logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("token", "dummy-token");
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-[70vh]"
    >
      <form
        className="bg-white rounded shadow p-8 min-w-[320px]"
        onSubmit={handleLogin}
      >
        <div className="flex justify-center mb-4">
          <MdPerson className="text-4xl text-blue-500" />
        </div>
        <h2 className="mb-4 text-xl font-bold text-center">Admin Login</h2>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            title="auth inputs"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            title="auth inputs"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center w-full gap-1 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          <MdLockOutline /> Login
        </button>
      </form>
    </motion.div>
  );
}
