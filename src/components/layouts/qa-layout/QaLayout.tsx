import React, { useState } from "react";
import Header from "../../common/layout/Header";
import QaSidebar from "./QaSidebar";

interface QaLayoutProps {
  children: React.ReactNode;
}

const QaLayout: React.FC<QaLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        moduleName="Quality Assurance"
        toggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />
      <div className="flex flex-1 max-w-full overflow-x-hidden pt-16">
        <div className="flex-shrink-0">
          <QaSidebar isOpen={isSidebarOpen} />
          <div
            className={`transition-all duration-300 ${
              isSidebarOpen ? "w-64" : "w-20"
            } hidden lg:block`}
          />
        </div>
        <main className="flex-1 min-w-0 p-8">{children}</main>
      </div>
    </div>
  );
};

export default QaLayout;
