import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaFileInvoice,
  FaMoneyBillWave,
  FaBook,
  FaChartBar,
  FaTachometerAlt,
  FaCogs,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

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
    to: "/accounts",
  },
  {
    label: "Financial Management",
    icon: <FaFileInvoice />,
    subItems: [
      {
        label: "Sales Invoices",
        icon: <FaFileInvoice />,
        subItems: [
          { label: "Invoice List", to: "/accounts/sales-invoices" },
          { label: "New Invoice", to: "/accounts/sales-invoices/new" },
        ],
      },
      {
        label: "Payments",
        icon: <FaMoneyBillWave />,
        subItems: [
          { label: "Payment List", to: "/accounts/payments" },
          { label: "Record Payment", to: "/accounts/payments/new" },
        ],
      },
      {
        label: "Purchase Invoices",
        icon: <FaFileInvoice />,
        subItems: [
          { label: "Purchase List", to: "/accounts/purchase-invoices" },
          { label: "New Purchase", to: "/accounts/purchase-invoices/new" },
        ],
      },
      { label: "Credit Notes", to: "/accounts/credit-notes" },
      { label: "Debit Notes", to: "/accounts/debit-notes" },
    ],
  },
  {
    label: "Chart of Accounts",
    icon: <FaChartBar />,
    to: "/accounts/chart-of-accounts",
  },
  {
    label: "General Ledger",
    icon: <FaBook />,
    subItems: [
      { label: "Journal Entries", to: "/accounts/journals" },
      { label: "Bank Reconciliation", to: "/accounts/bank-reconciliation" },
    ],
  },
  {
    label: "Reports",
    icon: <FaCogs />,
    subItems: [
      { label: "Accounts Receivable", to: "/accounts/accounts-receivable" },
      { label: "Accounts Payable", to: "/accounts/accounts-payable" },
      { label: "Trial Balance", to: "/accounts/trial-balance" },
      { label: "Financial Statements", to: "/accounts/financial-statements" },
      { label: "General Ledger", to: "/accounts/general-ledger" },
      { label: "Aging Reports", to: "/accounts/aging-reports" },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    if (isOpen) {
      setExpandedItems(prev =>
        prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
      );
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    if (hasSubItems) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
            style={{ paddingLeft: isOpen ? `${(level + 1) * 16}px` : '16px' }}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </div>
            {isOpen && <FiChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
          </button>
          {isOpen && isExpanded && item.subItems && (
            <div>
              {item.subItems.map(subItem => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.label}
        to={item.to || '#'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
            isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50'
          }`
        }
        style={{ paddingLeft: isOpen ? `${(level + 1) * 16}px` : '16px' }}
        title={!isOpen ? item.label : undefined}
      >
        {item.icon}
        {isOpen && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <aside className={`bg-white border-r border-gray-200 overflow-y-auto transition-all ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="py-4">
        {menuItems.map(item => renderMenuItem(item))}
      </div>
    </aside>
  );
};

export default Sidebar;