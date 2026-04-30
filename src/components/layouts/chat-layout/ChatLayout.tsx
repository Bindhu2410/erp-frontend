import React, { useState, useEffect } from "react";
import Header from "../../common/layout/Header";
import ChatSidebar from "./ChatSidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("chat-sidebar");
      const menuButton = document.getElementById("chat-menu-button");
      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header moduleName="Chat" toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <div id="chat-sidebar" className="flex-shrink-0">
          <ChatSidebar isOpen={sidebarOpen} />
          <div
            className={`hidden lg:block transition-all duration-300 ease-in-out ${
              sidebarOpen ? "w-64" : "w-0"
            }`}
          />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out pt-16 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;
