import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Navbar from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed for mobile, static for desktop */}
      <div className="fixed z-50 lg:static">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full min-h-screen transition-all duration-300 lg:ml-0">
        {/* Topbar for mobile */}
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          onNotificationsClick={() => {
            /* Handle mobile notifications */
          }}
          unreadCount={3}
        />

        {/* Navbar for desktop - Made sticky */}
        <div className="sticky top-0 z-30 hidden lg:block">
          <Navbar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-auto">
          <div className="w-full p-4 mx-auto max-w-7xl lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
