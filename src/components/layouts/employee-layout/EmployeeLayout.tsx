import React, { useState, useEffect } from "react";
import Header from "../../common/layout/Header";
import EmployeeSidebar from "./EmployeeSidebar";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("employee-sidebar");
      const menuButton = document.getElementById("employee-menu-button");

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header moduleName="Employee Management" toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 max-w-full overflow-x-hidden">
        <div id="employee-sidebar" className="flex-shrink-0">
          <EmployeeSidebar isOpen={sidebarOpen} />
          {/* Desktop Spacer to push main content when sidebar is open */}
          <div
            className={`hidden lg:block transition-all duration-300 ease-in-out ${
              sidebarOpen ? "w-64" : "w-0"
            }`}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out pt-16">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
