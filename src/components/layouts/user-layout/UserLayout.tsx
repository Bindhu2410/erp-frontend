import React, { ReactNode, useState } from "react";
import Header from "../../common/layout/Header";
import UserSidebar from "./UserSidebar";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        moduleName="User Management"
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 max-w-full overflow-x-hidden pt-16">
        <div className="flex-shrink-0">
          <UserSidebar isOpen={isSidebarOpen} />
          {/* Desktop Spacer */}
          <div
            className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"} hidden lg:block`}
          />
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default UserLayout;
