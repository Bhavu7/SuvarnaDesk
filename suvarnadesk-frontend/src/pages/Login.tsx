import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLockOutline, MdPerson } from "react-icons/md";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("token", "dummy-token");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form
        className="bg-white rounded shadow p-8 min-w-[320px]"
        onSubmit={handleLogin}
      >
        <div className="flex justify-center mb-4">
          <MdPerson className="text-4xl text-blue-500" />
        </div>
        <h2 className="mb-4 text-xl font-bold text-center">Admin Login</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            title="Enter your email"
            placeholder="admin@example.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            title="Enter your password"
            placeholder="Password"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center w-full gap-1 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          <MdLockOutline className="text-xl" /> Login
        </button>
      </form>
    </div>
  );
};

export default Login;
