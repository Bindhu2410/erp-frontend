import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiSettings,
  FiX,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";

interface MenuItem {
  name: string;
  icon: any;
  path?: string;
  items: SubMenuItem[];
}

interface SubMenuItem {
  name: string;
  path: string;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Detect screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isOpen]);

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) =>
      prev.includes(menu)
        ? prev.filter((item) => item !== menu)
        : [...prev, menu]
    );
  };

  // Handle menu item click on mobile - close sidebar after navigation
  const handleMenuItemClick = () => {
    if (isMobile) {
      onClose?.();
    }
  };

  // Get responsive width classes
  const getSidebarWidth = () => {
    if (isMobile) {
      return isOpen ? "w-64" : "w-0";
    } else if (isTablet) {
      return isOpen ? "w-56" : "w-16";
    } else {
      return isOpen ? "w-64" : "w-20";
    }
  };

  // Get responsive positioning classes
  const getSidebarPosition = () => {
    if (isMobile) {
      return "fixed left-0 top-0 h-full z-50";
    } else {
      return "fixed left-0 top-16 h-[calc(100vh-4rem)] z-40";
    }
  };

  // Dashboard-specific menu items - simplified to only show Chat, Calendar, and System Settings
  const getDashboardMenuItems = (): MenuItem[] => {
    const menuItems: MenuItem[] = [
      {
        name: "Chat",
        icon: FiMessageSquare,
        path: "/chat",
        items: [],
      },
      {
        name: "Calendar",
        icon: FiCalendar,
        path: "/calendar",
        items: [],
      },
      {
        name: "System Settings",
        icon: FiSettings,
        items: [
          { name: "General Settings", path: "/settings/general" },
          { name: "User Roles", path: "/settings/roles" },
          { name: "Permissions", path: "/settings/permissions" },
        ],
      },
    ];

    return menuItems;
  };

  const menuItems = getDashboardMenuItems();

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          ${getSidebarPosition()}
          ${getSidebarWidth()}
          bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden
          ${isMobile ? "border-r border-gray-200" : ""}
        `}
      >
        {/* Mobile header with close button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Dashboard Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Close sidebar"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>
        )}

        {/* Scrollable menu content */}
        <div
          className={`
          overflow-y-auto overflow-x-hidden
          ${isMobile ? "h-[calc(100%-4rem)]" : "h-full"}
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
        `}
        >
          <div className={`p-4 ${isMobile ? "pb-6" : ""}`}>
            {menuItems.map((item, index) => (
              <div key={index} className="mb-1">
                {item.items.length === 0 ? (
                  <NavLink
                    to={item.path || "#"}
                    onClick={handleMenuItemClick}
                    className={({ isActive }) => `
                      flex items-center justify-between cursor-pointer p-3 rounded-lg mb-1
                      transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                          : "hover:bg-gray-50 hover:text-gray-900 text-gray-700"
                      }
                      ${!isOpen && !isMobile ? "justify-center" : ""}
                    `}
                  >
                    <div className="flex items-center min-w-0">
                      <div
                        className={`
                        flex-shrink-0 
                        ${!isOpen && !isMobile ? "mx-auto" : ""}
                      `}
                      >
                        <item.icon
                          size={isMobile ? 22 : 20}
                          className="transition-colors duration-200"
                        />
                      </div>
                      {(isOpen || isMobile) && (
                        <span className="ml-3 font-medium truncate transition-all duration-200">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {/* Tooltip for collapsed desktop view */}
                    {!isOpen && !isMobile && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                ) : (
                  <div className="relative">
                    <div
                      className={`
                        flex items-center justify-between cursor-pointer p-3 rounded-lg mb-1
                        hover:bg-gray-50 hover:text-gray-900 text-gray-700
                        transition-all duration-200 group
                        ${!isOpen && !isMobile ? "justify-center" : ""}
                      `}
                      onClick={() => {
                        if (isOpen || isMobile) {
                          toggleMenu(item.name);
                        }
                      }}
                    >
                      <div className="flex items-center min-w-0">
                        <div
                          className={`
                          flex-shrink-0 
                          ${!isOpen && !isMobile ? "mx-auto" : ""}
                        `}
                        >
                          <item.icon
                            size={isMobile ? 22 : 20}
                            className="transition-colors duration-200"
                          />
                        </div>
                        {(isOpen || isMobile) && (
                          <span className="ml-3 font-medium truncate">
                            {item.name}
                          </span>
                        )}
                      </div>

                      {(isOpen || isMobile) && (
                        <FiChevronDown
                          size={18}
                          className={`
                            transition-transform duration-200 flex-shrink-0
                            ${openMenus.includes(item.name) ? "rotate-180" : ""}
                          `}
                        />
                      )}

                      {/* Tooltip for collapsed desktop view */}
                      {!isOpen && !isMobile && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </div>

                    {/* Submenu */}
                    {openMenus.includes(item.name) && (isOpen || isMobile) && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                        {item.items.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            onClick={handleMenuItemClick}
                            className={({ isActive }) => `
                              block cursor-pointer p-2 rounded-md text-sm font-medium
                              transition-all duration-200
                              ${
                                isActive
                                  ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                                  : "hover:bg-gray-50 hover:text-gray-900 text-gray-600"
                              }
                            `}
                          >
                            <span className="truncate">{subItem.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile footer */}
        {isMobile && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              © 2025 JBS Management System
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardSidebar;
