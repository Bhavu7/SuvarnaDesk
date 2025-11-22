import React, { useState } from "react";
import { useLogin } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          localStorage.setItem("token", res.token);
          navigate("/dashboard");
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <label className="block mb-2">Email</label>
        <input
          title="inputs"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded mb-4 w-full"
        />
        <label className="block mb-2">Password</label>
        <input
          title="inputs"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded mb-6 w-full"
        />
        <button
          type="submit"
          disabled={loginMutation.isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loginMutation.isLoading ? "Logging in..." : "Login"}
        </button>
        {loginMutation.isError && (
          <p className="text-red-600 mt-4">Invalid credentials</p>
        )}
      </form>
    </div>
  );
}
