import React, { useState } from "react";
import { Bell, Search, ChevronDown, LogOut, User, Settings, Menu } from "lucide-react";

interface HRMSHeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const notifications = [
  { id: 1, text: "Rahul Verma's leave request pending approval", time: "2m ago", unread: true },
  { id: 2, text: "Timesheet submitted by Kiran Reddy", time: "15m ago", unread: true },
  { id: 3, text: "March 2026 payroll processing complete", time: "1h ago", unread: false },
  { id: 4, text: "Performance review cycle starts next week", time: "3h ago", unread: false },
];

const HRMSHeader: React.FC<HRMSHeaderProps> = ({ collapsed, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={`fixed top-0 right-0 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6 py-3 shadow-sm transition-all duration-300 ${
        collapsed ? "left-16" : "left-64"
      }`}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search employees, modules..."
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <p className="font-semibold text-gray-800 text-sm">Notifications</p>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <ul className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <li key={n.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.unread ? "bg-blue-50" : ""}`}>
                    <p className="text-xs text-gray-700 leading-relaxed">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 border-t border-gray-100">
                <p className="text-xs text-center text-blue-600 cursor-pointer hover:underline">View all notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
              PN
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">Priya Nair</p>
              <p className="text-xs text-gray-500">HR Manager</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">Priya Nair</p>
                <p className="text-xs text-gray-500">priya.nair@company.com</p>
              </div>
              <ul className="py-1">
                {[
                  { icon: User, label: "My Profile" },
                  { icon: Settings, label: "Settings" },
                  { icon: LogOut, label: "Logout" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Icon className="w-4 h-4 text-gray-400" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HRMSHeader;
