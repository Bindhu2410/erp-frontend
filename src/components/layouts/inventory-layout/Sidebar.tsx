import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaCogs } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { AiFillSetting } from "react-icons/ai";
import { AiOutlineDropbox } from "react-icons/ai";
import { PiBookOpenTextFill } from "react-icons/pi";
import { TbFileInvoice } from "react-icons/tb";
import { BiSolidBookmarkAltMinus } from "react-icons/bi";
import { FaTasks } from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  label: string;
  icon?: JSX.Element;
  to?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    to: "/inventory/dashboard",
  },

  {
    label: "Item Management",
    icon: <AiFillSetting />,

    subItems: [
      { label: "Product Variants", to: "/product-variants" },
      { label: "Item Master", to: "/item-master" },
      { label: "Item Category", to: "/item-category" },
      { label: "Item Valuation", to: "/item-valuation" },
      { label: "UOM", to: "/uom-master" },
      { label: "Make", to: "/make-master" },
      { label: "Model", to: "/model-master" },
      { label: "Product", to: "/product-master" },
      { label: "Inventory Method", to: "/item-method" },
      { label: "Item Group", to: "/item-group" },
      { label: "Rate Master", to: "/item-rate-master" },
      { label: "Terms & Conditions", to: "/inventory/terms-conditions" },
      { label: "Accessories", to: "/inventory/accessories" },
      { label: "Quotation Title", to: "/quotation-title" },
      { label: "BOM", to: "/inventory/bom-master" },
      { label: "Delivery Challan", to: "/inventory/delivery-challan" },
      { label: "Issues", to: "/inventory/issues" },
    ],
  },

  // { label: "Inventory Method", to: "/item-method" },
  // { label: "Item Group", to: "/item-group" },
  // { label: "Rate Master", to: "/item-rate-master" },
  // { label: "Terms & Conditions", to: "/inventory/terms-conditions" },
  // { label: "Quotation Title", to: "/quotation-title" },
  // {
  //   label: "BOM",

  //   to: "/inventory/bom-master",
  // },

  {
    label: "Demo",
    icon: <AiOutlineDropbox />,
    subItems: [
      { label: "Demo Request", to: "/inventory/demo/create-request" },
    ],
  },
  // {
  //   label: "Item Location",
  //   icon: <FaCogs />,
  //   to: "/locations",
  // },
  // {
  //   label: "Warehouse",
  //   icon: <FaCogs />,
  //   to: "/warehouses",
  // },
  // {
  //   label: "Item Stocks",
  //   icon: <FaEye />,
  //   to: "/stocks",
  // },

  { label: "Invoices", icon: <TbFileInvoice />, to: "/invoices" },
  {
    label: "Receipt",
    icon: <BiSolidBookmarkAltMinus />,
    to: "/receipt",
  },
  {
    label: "Tasks",
    icon: <FaTasks />,
    to: "/tasks",
  },
];

const InventorySidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Inventory Masters": true,
    "Item Management": true,
    "Rate Management": true,
    "Master Data": true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isGroupOpen = openGroups[item.label] || false;

    // For top-level items with subitems (collapsible groups)
    if (hasSubItems && level === 0) {
      return (
        <div key={item.label}>
          <button
            type="button"
            className={`flex items-center w-full p-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 group ${isGroupOpen && isOpen
                ? "bg-blue-50 font-semibold text-blue-600"
                : ""
              }`}
            onClick={() => toggleGroup(item.label)}
          >
            <span className="flex items-center min-w-0">
              <span
                className={`min-w-[20px] ${isGroupOpen && isOpen
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-blue-600"
                  }`}
              >
                {item.icon}
              </span>
              {isOpen && (
                <span className="ml-3 font-medium truncate">{item.label}</span>
              )}
            </span>
            {isOpen && (
              <FiChevronDown
                className={`ml-auto transition-transform ${isGroupOpen ? "rotate-180" : ""
                  }`}
              />
            )}
          </button>

          {/* Submenu items */}
          {isGroupOpen && isOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
              {item.subItems!.map((subItem) =>
                renderMenuItem(subItem, level + 1),
              )}
            </div>
          )}
        </div>
      );
    }

    // For nested items with subitems (sub-groups)
    if (hasSubItems && level > 0) {
      return (
        <div key={item.label} className="mb-1">
          <button
            type="button"
            className={`flex items-center w-full p-2 rounded-md transition-colors text-sm font-medium hover:bg-gray-50 group ${isGroupOpen
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
            onClick={() => toggleGroup(item.label)}
          >
            <span className="flex items-center min-w-0">
              <span
                className={`min-w-[16px] text-xs ${isGroupOpen
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-blue-600"
                  }`}
              >
                {item.icon}
              </span>
              <span className="ml-2 truncate">{item.label}</span>
            </span>
            <FiChevronDown
              className={`ml-auto transition-transform text-xs ${isGroupOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Sub-submenu items */}
          {isGroupOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
              {item.subItems!.map((subItem) =>
                renderMenuItem(subItem, level + 2),
              )}
            </div>
          )}
        </div>
      );
    }

    // For regular navigation links (no subitems)
    if (item.to) {
      return (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center p-${level > 0 ? "2" : "3"} rounded-${level > 0 ? "md" : "lg"
            } transition-colors ${level > 0 ? "text-sm" : "font-medium"
            } text-gray-700 hover:bg-gray-50 group ${isActive
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : ""
            }`
          }
        >
          {level > 0 ? (
            // Nested items without icons
            <span className="truncate">{item.label}</span>
          ) : (
            // Top-level items with icons
            <>
              <span className="min-w-[20px]">{item.icon}</span>
              {isOpen && <span className="ml-3 truncate">{item.label}</span>}
            </>
          )}
        </NavLink>
      );
    }

    return null;
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 overflow-y-auto ${isOpen ? "w-64" : "w-20"
        }`}
    >
      <div className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </div>
    </aside>
  );
};

export default InventorySidebar;
