import React, { useState } from "react";
import Header from "../../common/layout/Header";
import TaskManagementSidebar from "./TaskManagementSidebar";

const TaskManagementLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        moduleName="Task Management"
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 max-w-full overflow-x-hidden pt-16">
        <div className="flex-shrink-0">
          <TaskManagementSidebar isOpen={isSidebarOpen} />
          <div
            className={`transition-all duration-300 ${
              isSidebarOpen ? "w-64" : "w-20"
            } hidden lg:block`}
          />
        </div>
        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>
    </div>
  );
};

export default TaskManagementLayout;
