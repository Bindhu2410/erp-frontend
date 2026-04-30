import React, { useState } from "react";
import Header from "../../common/layout/Header";
import ProcurementSidebar from "./Sidebar";

const ProcurementLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        moduleName="Procurement Management"
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 max-w-full overflow-x-hidden pt-16">
        <div className="flex-shrink-0">
          <ProcurementSidebar isOpen={isSidebarOpen} />
          {/* Desktop Spacer */}
          <div
            className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"} hidden lg:block`}
          />
        </div>
        <main className="flex-1 min-w-0 p-8">{children}</main>
      </div>
    </div>
  );
};

export default ProcurementLayout;
