import React, { useState } from "react";
import Header from "../../common/layout/Header";

interface CalendarLayoutProps {
  children: React.ReactNode;
}

const CalendarLayout: React.FC<CalendarLayoutProps> = ({ children }) => {
  // If Calendar needs a sidebar, add logic here. For now, simple layout:
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header moduleName="Calendar" toggleSidebar={toggleSidebar} />
      {/* Add sidebar here if needed */}
      <main className="flex-1 pt-16 p-6">{children}</main>
    </div>
  );
};

export default CalendarLayout;
