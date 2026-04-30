import React from "react";
import {
  MdInbox,
  MdSend,
  MdDrafts,
  MdDelete,
  MdLabel,
  MdEdit,
} from "react-icons/md";

interface EmailSidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onCompose: () => void;
}

const EmailSidebar: React.FC<EmailSidebarProps> = ({
  currentView,
  setCurrentView,
  onCompose,
}) => {
  const menuItems = [
    { id: "inbox", icon: <MdInbox />, label: "Inbox", count: 12 },
    { id: "sent", icon: <MdSend />, label: "Sent", count: 0 },
    { id: "drafts", icon: <MdDrafts />, label: "Drafts", count: 3 },
    { id: "trash", icon: <MdDelete />, label: "Trash", count: 0 },
    { id: "labels", icon: <MdLabel />, label: "Labels", count: 0 },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <button
        onClick={onCompose}
        className="mx-4 mt-4 mb-6 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
      >
        <MdEdit className="text-xl" />
        <span>Compose</span>
      </button>

      <nav className="flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              currentView === item.id ? "bg-blue-50 text-blue-600" : ""
            }`}
          >
            <span className="text-xl mr-4">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.count > 0 && (
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default EmailSidebar;
