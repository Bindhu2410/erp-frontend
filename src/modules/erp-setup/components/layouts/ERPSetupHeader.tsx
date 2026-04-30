import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// removed FontAwesome icons to use a cleaner tab-like header
import { useUser } from "../../../../context/UserContext";
import { FiChevronDown, FiEdit, FiLogOut, FiUser,FiHome } from "react-icons/fi";

import { MdDashboard } from "react-icons/md";
import { AuthService } from "../../../../services/authService";

type NavLink = { name: string; to: string };
type NavGroup = {
  key: string;
  title: string;
  icon?: any;
  items: (NavLink | "divider")[];
};

const ERPSetupHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useUser();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const isActive = (path: string) => location.pathname.includes(path);

  const navGroups: NavGroup[] = [
    {
      key: "company",
      title: "Company Setup",
      items: [
        { name: "Company Setup", to: "/erp-setup/company-setup" },
        { name: "Branch Setup", to: "/erp-setup/branch-setup" },
        { name: "Warehouse Definition", to: "/erp-setup/warehouse-setup" },
        { name: "Inventory Location", to: "/erp-setup/inventory-location" },
        "divider",
        { name: "Cost Centre", to: "/erp-setup/cost-centre" },
        { name: "Bank Account", to: "/erp-setup/bank-account" },
      ],
    },
    {
      key: "finance",
      title: "Accounting",
      items: [
        { name: "Bank Account", to: "/erp-setup/bank-account" },
        { name: "Chart of Accounts", to: "/erp-setup/chart-of-accounts" },
        { name: "Accounting Periods", to: "/erp-setup/accounting-periods" },
        { name: "Default Accounts", to: "/erp-setup/default-accounts" },
        { name: "Payment Terms", to: "/erp-setup/payment-terms" },
        { name: "Currency Exchange Rates", to: "/erp-setup/currency-rates" },
        { name: "Financial Statements", to: "/erp-setup/financial-statements" },
        { name: "Journal Templates", to: "/erp-setup/journal-templates" },
      ],
    },
    {
      key: "tax",
      title: "Tax Setup",
      items: [
        { name: "GST Setup", to: "/erp-setup/gst-setup" },
        { name: "HSN Codes", to: "/erp-setup/hsn-codes" },
        { name: "SAC Codes", to: "/erp-setup/sac-codes" },
        { name: "TDS Setup", to: "/erp-setup/tds-setup" },
      ],
    },
    {
      key: "additional",
      title: "Additional",
      items: [
        { name: "Intercompany Setup", to: "/erp-setup/intercompany-setup" },
        { name: "Document Templates", to: "/erp-setup/document-templates" },
        { name: "Setup Reports", to: "/erp-setup/setup-reports" },
      ],
    },
    {
      key: "users",
      title: "Reports",
      items: [
        { name: "User Setup", to: "/erp-setup/user-setup" },
        { name: "Role Definition", to: "/erp-setup/role-definition" },
        { name: "Approval Hierarchy", to: "/erp-setup/approval-hierarchy" },
        { name: "User Activity Log", to: "/erp-setup/user-activity" },
      ],
    },
  ];

  const userInitials = AuthService.getUserInitials();
  const userDisplayName = AuthService.getUserDisplayName() || "Guest User";
  const roleDto = JSON.parse(localStorage.getItem("roleDto") || "null");
  
  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  // Accessibility: handle Escape to close open dropdowns and focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // When a nav dropdown opens, focus its first focusable item for keyboard users
  useEffect(() => {
    if (!openDropdown) return;
    // Allow render to complete
    setTimeout(() => {
      const selector = `[data-dropdown="${openDropdown}"] a, [data-dropdown="${openDropdown}"] button`;
      const first = document.querySelector(selector) as HTMLElement | null;
      first?.focus();
    }, 0);
  }, [openDropdown]);

  // Close any open dropdowns when navigation changes
  useEffect(() => {
    setOpenDropdown(null);
    setShowUserDropdown(false);
  }, [location.pathname]);

  // Prevent outside clicks from closing dropdowns: when a dropdown is open,
  // intercept document clicks in the capture phase and stop propagation for
  // clicks that occur outside the nav. This keeps other global outside-click
  // handlers from reacting and closing our dropdown.
  useEffect(() => {
    const captureHandler = (e: MouseEvent) => {
      if (!openDropdown) return;
      const target = e.target as Node;
      if (navRef.current && !navRef.current.contains(target)) {
        // stop other document handlers from running
        try {
          e.stopImmediatePropagation();
        } catch (err) {}
      }
    };

    document.addEventListener("click", captureHandler, true);
    return () => document.removeEventListener("click", captureHandler, true);
  }, [openDropdown]);

  return (
    <nav className="bg-white shadow-sm mb-4">
      <div className=" mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}

        <div className="flex items-center">
          <img
            src={process.env.PUBLIC_URL + "/jbs_logo.png"}
            alt="JBS Meditec Logo"
            className="h-10 ml-4"
          />
        </div>

        {/* Main Navigation */}
        <div className="flex space-x-6">
          {navGroups.map((group) => (
            <div key={group.key} className="relative">
              <button
                className={`flex items-center gap-2 text-lg font-semibold ${
                  isActive(group.key)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => toggleDropdown(group.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleDropdown(group.key);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpenDropdown(group.key);
                  }
                }}
                aria-haspopup="true"
                aria-expanded={openDropdown === group.key}
              >
                <span className="flex items-center gap-2">
                  <span>{group.title}</span>
                  <FiChevronDown size={14} className="text-gray-500" />
                </span>
              </button>
              {openDropdown === group.key && (
                <div
                  data-dropdown={group.key}
                  className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded border z-50"
                >
                  {group.items.map((item, index) =>
                    item === "divider" ? (
                      <hr
                        key={`${group.key}-divider-${index}`}
                        className="my-1 border-gray-200"
                      />
                    ) : (
                      <Link
                        key={`${group.key}-${index}`}
                        to={item.to}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        

        {/* Admin Dropdown */}
        <div className="relative">
          <div className="flex items-center justify-between space-x-4">
            <div>
            <Link to="/dashboard" className="text-lg font-semibold">
              <span className="flex justify-between items-center">
                <FiHome size={20} />
              </span>
            </Link>
            </div>
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowUserDropdown((s) => !s);
                  } else if (e.key === "Escape") {
                    setShowUserDropdown(false);
                  }
                }}
              >
                <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-semibold">
                  {userInitials}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {userDisplayName}
                  </span>
                  {roleDto?.roleName && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {roleDto.roleName}
                    </span>
                  )}
                </div>
                <FiChevronDown
                  size={16}
                  className="text-gray-600 dark:text-gray-200"
                />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-50">
                  <button
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiUser size={16} className="mr-3" />
                    View Profile
                  </button>
                  <button
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiEdit size={16} className="mr-3" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {openDropdown === "admin" && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded border z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <hr className="my-1 border-gray-200" />
                <Link
                  to="/logout"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </Link>
              </div>
            )}

            <div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiLogOut
                  size={20}
                  className="text-gray-600 dark:text-gray-200"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ERPSetupHeader;
