import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import WorkerJobs from "./pages/WorkerJobs";
import Rates from "./pages/Rates";
import LabourCharges from "./pages/LabourCharges";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Topbar
              shopName="SuvarnaDesk"
              adminName="Admin"
              onLogout={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            />
            <main className="flex-grow overflow-auto p-4 bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <PrivateRoute>
                      <Billing />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/worker-jobs"
                  element={
                    <PrivateRoute>
                      <WorkerJobs />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/rates"
                  element={
                    <PrivateRoute>
                      <Rates />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/labour-charges"
                  element={
                    <PrivateRoute>
                      <LabourCharges />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}
