import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Rates from "./pages/Rates";
// import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Repairings from "./pages/Repairings";
import ManageCustomers from "./pages/ManageCustomers";
import ErrorBoundary from "./components/ErrorBoundary";
import { ComponentType } from "react";

// Define props interface for components
interface ComponentProps {
  [key: string]: any;
}

// Error wrapper for components with proper TypeScript types
const withErrorBoundary = <P extends ComponentProps>(
  Component: ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  // Set display name for better debugging
  WrappedComponent.displayName = `WithErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

// Wrap all page components with error boundary
const DashboardWithErrorBoundary = withErrorBoundary(Dashboard);
const BillingWithErrorBoundary = withErrorBoundary(Billing);
const RatesWithErrorBoundary = withErrorBoundary(Rates);
// const ReportsWithErrorBoundary = withErrorBoundary(Reports);
const SettingsWithErrorBoundary = withErrorBoundary(Settings);
const ProfileWithErrorBoundary = withErrorBoundary(Profile);
const RepairingsWithErrorBoundary = withErrorBoundary(Repairings);
const ManageCustomersWithErrorBoundary = withErrorBoundary(ManageCustomers);
const LayoutWithErrorBoundary = withErrorBoundary(Layout);

function App() {
  return (
    <ErrorBoundary>
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
                <Route path="/" element={<LayoutWithErrorBoundary />}>
                  <Route index element={<DashboardWithErrorBoundary />} />
                  <Route
                    path="billing"
                    element={<BillingWithErrorBoundary />}
                  />
                  <Route
                    path="/manage-customers"
                    element={<ManageCustomersWithErrorBoundary />}
                  />
                  <Route path="rates" element={<RatesWithErrorBoundary />} />
                  {/* <Route
                    path="reports"
                    element={<ReportsWithErrorBoundary />}
                  /> */}
                  <Route
                    path="repairings"
                    element={<RepairingsWithErrorBoundary />}
                  />
                  <Route
                    path="settings"
                    element={<SettingsWithErrorBoundary />}
                  />
                  <Route
                    path="profile"
                    element={<ProfileWithErrorBoundary />}
                  />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
