import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiList, FiClock, FiBarChart2 } from 'react-icons/fi';
import { FiCheckSquare } from 'react-icons/fi';

interface TaskManagementSidebarProps {
  isOpen: boolean;
}

const sidebarLinks = [
  { label: 'My Tasks', to: '/task-management', icon: FiList },
  { label: 'Assigned by Me', to: '/task-management/assigned-by-me', icon: FiCheckSquare },
];

const TaskManagementSidebar: React.FC<TaskManagementSidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-30 overflow-y-auto ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="p-4">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/task-management'}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg font-medium mb-2 transition-colors ${
                isActive
                  ? 'bg-orange-50 text-[#FF6B35]'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-[#FF6B35]'
              }`
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

export default TaskManagementSidebar;
