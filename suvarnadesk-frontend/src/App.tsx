import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Rates from "./pages/Rates";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Repairings from "./pages/Repairings";
import ManageCustomers from "./pages/ManageCustomers";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                padding: "12px 20px",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
                maxWidth: "400px",
                wordBreak: "break-word",
              },
              success: {
                style: {
                  background: "rgba(16, 185, 129, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                },
              },
              error: {
                style: {
                  background: "rgba(239, 68, 68, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                },
              },
              loading: {
                style: {
                  background: "rgba(59, 130, 246, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="billing" element={<Billing />} />
                <Route path="/manage-customers" element={<ManageCustomers />} />
                <Route path="rates" element={<Rates />} />
                <Route path="reports" element={<Reports />} />
                <Route path="repairings" element={<Repairings />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
