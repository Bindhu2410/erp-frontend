import React from 'react';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Sidebar logic removed
  const getMainContentMargin = () => 'ml-0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
  <DashboardHeader />
      {/* Main Content */}
      <main
        className={`
          pt-16 transition-all duration-300 ease-in-out
          ${getMainContentMargin()}
        `}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
