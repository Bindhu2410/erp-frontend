import React, { useState } from "react";
import HRMSSidebar from "./HRMSSidebar";
import HRMSHeader from "./HRMSHeader";
import { HRMSModule } from "./types";
import HRMSDashboard from "./modules/HRMSDashboard";
import EmployeeManagement from "./modules/EmployeeManagement";
import AttendanceManagement from "./modules/AttendanceManagement";
import TimesheetManagement from "./modules/TimesheetManagement";
import PayrollManagement from "./modules/PayrollManagement";
import PerformanceManagement from "./modules/PerformanceManagement";
import LettersDocuments from "./modules/LettersDocuments";
import InventoryManagement from "./modules/InventoryManagement";
import ReportsModule from "./modules/ReportsModule";
import SettingsModule from "./modules/SettingsModule";

const moduleTitles: Record<HRMSModule, string> = {
  dashboard: "Dashboard",
  employees: "Employee Management",
  attendance: "Attendance",
  timesheets: "Timesheets",
  payroll: "Payroll",
  performance: "Performance Management",
  letters: "Letters & Documents",
  inventory: "Inventory Management",
  reports: "Reports",
  settings: "Settings",
};

const HRMSPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<HRMSModule>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":    return <HRMSDashboard />;
      case "employees":   return <EmployeeManagement />;
      case "attendance":  return <AttendanceManagement />;
      case "timesheets":  return <TimesheetManagement />;
      case "payroll":     return <PayrollManagement />;
      case "performance": return <PerformanceManagement />;
      case "letters":     return <LettersDocuments />;
      case "inventory":   return <InventoryManagement />;
      case "reports":     return <ReportsModule />;
      case "settings":    return <SettingsModule />;
      default:            return <HRMSDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <HRMSSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      {/* Header */}
      <HRMSHeader
        collapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 min-h-screen ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Breadcrumb */}
        <div className={`bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-2 text-sm`}>
          <span className="text-gray-400">HRMS</span>
          <span className="text-gray-300">/</span>
          <span className="text-blue-700 font-medium">{moduleTitles[activeModule]}</span>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default HRMSPage;
