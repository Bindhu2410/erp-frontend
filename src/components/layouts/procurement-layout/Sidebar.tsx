import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaFileAlt,
  FaEye,
  FaTachometerAlt,
  FaCogs,
  FaPlus,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

interface SidebarProps {
  isOpen: boolean;
}

const procurementMasters = [
  { label: "Dashboard", to: "/procurement/dashboard" },
  { label: "Purchase Requests", to: "/Purchase-Requisition" },
  { label: "Purchase Orders", to: "/purchase-order" },
  { label: "Vendors", to: "/procurement/vendors" },
  { label: "GRN List", to: "/goods-receipt-note" },
  { label: "New GRN", to: "/goods-receipt-note/new" },
  { label: "Tasks", to: "/procurement/tasks" },
];
const ProcurementSidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [openMasters, setOpenMasters] = useState(true);

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 overflow-y-auto ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4">
        <div className="space-y-2">
          {/* Top-level: Dashboard */}
          <NavLink
            to="/procurement/dashboard"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors font-medium text-gray-700 hover:bg-gray-50 group ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : ""
              }`
            }
          >
            <FaTachometerAlt className="min-w-[20px]" />
            {isOpen && <span className="ml-3 truncate">Dashboard</span>}
          </NavLink>

          {/* Top-level: Procurement */}
          <NavLink
            to="/procurement/purchase-orders"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors font-medium text-gray-700 hover:bg-gray-50 group ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : ""
              }`
            }
          >
            <FaCogs className="min-w-[20px]" />
            {isOpen && <span className="ml-3 truncate">Purchase Orders</span>}
          </NavLink>

          {/* Procurement Masters group */}
          <div>
            <button
              type="button"
              className={`flex items-center w-full p-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 group ${
                openMasters && isOpen
                  ? "bg-blue-50 font-semibold text-blue-600"
                  : ""
              }`}
              onClick={() => setOpenMasters((v) => !v)}
            >
              <span className="flex items-center min-w-0">
                <FaFileAlt
                  className={`min-w-[20px] ${
                    openMasters && isOpen
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-blue-600"
                  }`}
                />
                {isOpen && (
                  <span className="ml-3 font-medium truncate">
                    Procurement Masters
                  </span>
                )}
              </span>
              {isOpen && (
                <FiChevronDown
                  className={`ml-auto transition-transform ${
                    openMasters ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
            {/* Submenu: no icons for submenu items */}
            {openMasters && (
              <div
                className={`ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3 ${
                  isOpen ? "" : "hidden"
                }`}
              >
                {procurementMasters.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `block p-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                          : "hover:bg-gray-50 hover:text-gray-900 text-gray-600"
                      }`
                    }
                  >
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ProcurementSidebar;
