import React, { useState } from "react";
import Header from "../../common/layout/Header";
import AccountingSidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const AccountingLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header moduleName="Accounts" toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden mt-16">
        <AccountingSidebar isOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AccountingLayout;
