import React, { useState } from "react";
import { useLogin } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 font-semibold text-center">Admin Login</h2>
        <label className="block mb-2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full mb-4"
        />
        <label className="block mb-2">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full mb-6"
        />
        <button
          type="submit"
          disabled={loginMutation.isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loginMutation.isLoading ? "Logging in..." : "Login"}
        </button>
        {loginMutation.isError && (
          <p className="text-red-600 mt-4">
            Login failed. Please check your credentials.
          </p>
        )}
      </form>
    </div>
  );
}
