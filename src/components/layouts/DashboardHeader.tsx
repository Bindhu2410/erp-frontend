import React, { useState } from "react";
import {
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get user info from localStorage
  let userName = 'Admin';
  let userEmail = '';
  let userRole = '';
  let fullName = '';
  let userInfo = null;
  
  try {
    const roleDtoStr = localStorage.getItem('roleDto');
    if (roleDtoStr) {
      const roleDto = JSON.parse(roleDtoStr);
      userRole = roleDto.roleName || '';
    }
    
    const userDtoStr = localStorage.getItem('user');
    if (userDtoStr) {
      userInfo = JSON.parse(userDtoStr);
      userName = userInfo.username || 'Admin';
      userEmail = userInfo.email || '';
      fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userName;
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('roleDto');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md h-16 fixed w-full top-0 z-50 flex items-center justify-between px-4">
      <div className="flex items-center">
        <img
          src={process.env.PUBLIC_URL + "/jbs_logo.png"}
          alt="JBS Meditec Logo"
          className="h-10"
        />
      </div>

      <div className="flex items-center space-x-4">
        {/* User Profile & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FiUser size={16} className="text-white" />
            </div>
            <div className="text-left hidden sm:block max-w-[120px] truncate">
              <p className="text-sm font-medium text-gray-800 truncate" title={fullName}>{fullName}</p>
              <p className="text-xs text-gray-500 truncate" title={userRole}>{userRole}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800 break-words max-w-full" style={{wordBreak: 'break-word'}} title={fullName}>{fullName}</p>
                <p className="text-xs text-gray-500 mb-1 break-all max-w-full" title={userName}>@{userName}</p>
                <p className="text-xs text-gray-500 break-all max-w-full" title={userEmail}>{userEmail}</p>
                <p className="text-xs text-blue-600 mt-1 break-words max-w-full" title={userRole}>{userRole}</p>
              </div>
              {userInfo && (
                <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-600">
                 
                  <div className="flex justify-between mb-1">
                    <span>Status:</span>
                    <span className={userInfo.isActive ? 'text-green-600' : 'text-red-600'}>
                      {userInfo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{userInfo.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
              )}
          
            </div>
          )}
        </div>
            
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <FiLogOut size={20} className="inline mr-2" />
              </button>
      </div>

      {/* Click outside to close dropdowns */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default DashboardHeader;
