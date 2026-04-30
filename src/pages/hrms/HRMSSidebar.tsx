import React from "react";
import {
  LayoutDashboard, Users, Clock, FileText, DollarSign,
  TrendingUp, Mail, Package, BarChart2, Settings,
  ChevronLeft, ChevronRight, Building2
} from "lucide-react";
import { HRMSModule } from "./types";

interface SidebarItem {
  id: HRMSModule;
  label: string;
  icon: React.ElementType;
}

const navItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employee Management", icon: Users },
  { id: "attendance", label: "Attendance", icon: Clock },
  { id: "timesheets", label: "Timesheets", icon: FileText },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "performance", label: "Performance (PMP)", icon: TrendingUp },
  { id: "letters", label: "Letters & Documents", icon: Mail },
  { id: "inventory", label: "Inventory Management", icon: Package },
  { id: "reports", label: "Reports", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
];

interface HRMSSidebarProps {
  activeModule: HRMSModule;
  onModuleChange: (module: HRMSModule) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const HRMSSidebar: React.FC<HRMSSidebarProps> = ({
  activeModule, onModuleChange, collapsed, onToggleCollapse
}) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col transition-all duration-300 z-40 shadow-2xl ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-blue-700 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-blue-800" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight">HRMS Portal</p>
            <p className="text-blue-300 text-xs">JBS Enterprise</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1 px-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => onModuleChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  activeModule === id
                    ? "bg-white text-blue-800 shadow-md"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? label : ""}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${activeModule === id ? "text-blue-700" : ""}`} />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-blue-700">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-blue-200 hover:bg-blue-700 hover:text-white transition-colors text-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default HRMSSidebar;
