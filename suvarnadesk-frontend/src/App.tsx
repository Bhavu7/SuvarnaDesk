import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Billing from "./pages/Billing";
import WorkerJobs from "./pages/WorkerJobs";
import Rates from "./pages/Rates";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen font-inter bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/worker-jobs" element={<WorkerJobs />} />
              <Route path="/rates" element={<Rates />} />
              <Route path="/" element={<Billing />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
