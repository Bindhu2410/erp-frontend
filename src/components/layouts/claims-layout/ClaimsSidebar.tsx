import React from "react";
import { NavLink } from "react-router-dom";
import { FiFileText, FiPlusCircle, FiList } from "react-icons/fi";
import { useUser } from "../../../context/UserContext";

interface ClaimsSidebarProps {
  isOpen: boolean;
}

const sidebarLinks = [
  { label: "Tasks", to: "/claims/tasks", icon: FiList },
  { label: "Claim Vouchers", to: "/claims/vouchers", icon: FiFileText },
  // { label: 'Claim Voucher', to: '/claims/voucher', icon: FiFileText },
  { label: "New Claim", to: "/claims/new", icon: FiPlusCircle },
];

const ClaimsSidebar: React.FC<ClaimsSidebarProps> = ({ isOpen }) => {
  const { role } = useUser();
  const roleName = role?.roleName || "";
  const isFinance = roleName === "Finance" || roleName === "Finance Department";

  // Hide the New Claim link for Finance users and show Tasks only for Finance
  const linksToShow = sidebarLinks.filter((link) => {
    // New Claim hidden for Finance users
    if (isFinance && link.label === "New Claim") return false;
    // Tasks and Claim Voucher only visible to Finance
    if (link.label === "Tasks" || link.label === "Claim Voucher")
      return isFinance;
    return true;
  });

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-30 overflow-y-auto ${isOpen ? "w-64" : "w-20"}`}
    >
      <nav className="p-4">
        {linksToShow.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg font-medium mb-2 transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"}`
            }
          >
            <link.icon size={20} className="flex-shrink-0" />
            {isOpen && <span className="ml-3 truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default ClaimsSidebar;
