import React from "react";
import { NavLink } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";

interface ChatSidebarProps {
  isOpen: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen }) => {
  const menuItems = [
    {
      title: "Chat",
      items: [{ name: "Messages", path: "/chat", icon: FiMessageSquare }],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } w-64 overflow-y-auto`}
    >
      <div className="p-4">
        <nav className="space-y-6">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          isActive
                            ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ChatSidebar;
