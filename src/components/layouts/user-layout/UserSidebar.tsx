import React from "react";
import { NavLink } from "react-router-dom";
import { FiUsers, FiShield, FiGitBranch } from "react-icons/fi";

interface UserSidebarProps {
  isOpen: boolean;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen }) => {
  const menuItems = [
    { name: "Users & Roles", path: "/user-management/users", icon: FiUsers },
    { name: "Roles & Permissions", path: "/user-management/roles", icon: FiShield },
    { name: "Team Hierarchy", path: "/user-management/hierarchy", icon: FiGitBranch },
  ];

  return (
    <div
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 overflow-y-auto ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `
                flex items-center p-3 rounded-lg transition-colors
                ${isActive ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500 shadow-sm' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
                focus:outline-none focus:ring-2 focus:ring-blue-200'
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={`min-w-[20px] ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                  <span className={`ml-3 ${!isOpen ? 'hidden' : ''}`}>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
