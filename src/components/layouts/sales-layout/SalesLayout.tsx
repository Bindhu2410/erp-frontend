import React, { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "../../common/layout/Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  // Detect screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setIsSidebarOpen(false);
      } else if (width >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Calculate spacer width based on screen size and sidebar state
  const getSpacerWidth = () => {
    if (isMobile) {
      return "w-0";
    } else if (isTablet) {
      return isSidebarOpen ? "w-56" : "w-16";
    } else {
      return isSidebarOpen ? "w-64" : "w-20";
    }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header moduleName="Sales" toggleSidebar={handleSidebarToggle} />
      <div className="flex flex-1 max-w-full overflow-x-hidden pt-16">
        <div className="flex-shrink-0">
          <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
          {/* Desktop/Tablet Spacer */}
          <div
            className={`transition-all duration-300 ease-in-out hidden sm:block ${getSpacerWidth()}`}
          />
        </div>

        <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)]">
          <div
            className={`
            ${isMobile ? "p-4" : "p-6"}
            ${isMobile ? "pb-20" : ""}
          `}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Chat Bot Icon */}
      {/* <ChatButton onClick={() => setIsChatOpen(true)} /> */}

      {/* Chat Modal */}
      {/* <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} /> */}
    </div>
  );
};

export default Layout;
