import React, { useState, useEffect, useRef } from "react";
import {
  FiMenu,
  FiMoon,
  FiSun,
  FiBell,
  FiLogOut,
  FiUser,
  FiEdit,
  FiChevronDown,
  FiHome,
} from "react-icons/fi";
import AuthService from "../../../services/authService";
import { useNavigate } from "react-router-dom";
import ProfileViewModal from "../../user-profile/ProfileViewModal";
import ProfileEditModal from "../../user-profile/ProfileEditModal";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// Remove hardcoded routeMap. We'll dynamically check available routes.

const Header = ({ moduleName, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notifications] = useState([
    { id: 1, text: "New notification", time: "5m ago" },
    { id: 2, text: "Another notification", time: "1h ago" },
  ]);
  const [showVoice, setShowVoice] = useState(false);

  const userDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Get user display name from localStorage
  const userDisplayName = AuthService.getUserDisplayName() || "Guest User";
  const userInitials = AuthService.getUserInitials();
  const currentUser = AuthService.getCurrentUser();
  const roleDto = JSON.parse(localStorage.getItem("roleDto") || "null");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const handleViewProfile = () => {
    setShowUserDropdown(false);
    setShowProfileModal(true);
  };

  const handleEditProfile = () => {
    setShowUserDropdown(false);
    setShowEditModal(true);
  };

  useEffect(() => {
    if (!listening && transcript) {
      const lower = transcript.toLowerCase();
      // List of possible routes (add or import your actual routes here)
      const possibleRoutes = [
        "/Dashboard",
        "/sales/opportunities",
        "/sales/leads",
        "/sales/quotations",
        "/sales/demos",
        "/sales/payments",
        "/invoices",
        // Add more routes as needed or import from your route config
      ];

      // Try to find a route that matches the spoken keyword
      const foundRoute = possibleRoutes.find((route) =>
        lower.includes(route.split("/").pop().toLowerCase()),
      );
      if (foundRoute) {
        navigate(foundRoute);
        resetTranscript();
        setShowVoice(false);
      } else {
        // Optionally, show a message if no route is found
        alert("No matching page found for: " + transcript);
        resetTranscript();
        setShowVoice(false);
      }
    }
  }, [listening, transcript, navigate, resetTranscript]);

  return (
    <header className="bg-white dark:bg-gray-800 h-16 fixed w-full top-0 z-50 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center">
        {typeof toggleSidebar === "function" && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiMenu size={24} className="text-gray-600 dark:text-gray-200" />
          </button>
        )}
        <img
          src={process.env.PUBLIC_URL + "/jbs_logo.png"}
          alt="JBS Meditec Logo"
          className="h-10 ml-4"
        />
        <span className="ml-4 text-xl font-bold text-indigo-700 tracking-tight hidden sm:block">
          {moduleName}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex items-center">
          <div
            onClick={() => navigate("/Dashboard")}
            className="cursor-pointer"
          >
            <FiHome size={20} />
          </div>
          <button
            onClick={() => {
              setShowVoice(true);
              SpeechRecognition.startListening({ continuous: false });
            }}
            className="ml-2 p-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="Voice Navigation"
          >
            🎤
          </button>
          {showVoice && (
            <div className="absolute right-0 mt-10 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 px-4 border border-gray-200 dark:border-gray-700 z-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  Speak a page name...
                </span>
                <button
                  onClick={() => {
                    setShowVoice(false);
                    SpeechRecognition.stopListening();
                    resetTranscript();
                  }}
                  className="ml-2 text-red-500"
                >
                  ✖
                </button>
              </div>
              <div className="text-gray-800 dark:text-gray-100 mb-2">
                {listening
                  ? "Listening..."
                  : transcript || "Click mic and speak"}
              </div>
              <button
                onClick={() => {
                  SpeechRecognition.stopListening();
                }}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiBell size={20} className="text-gray-600 dark:text-gray-200" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {notification.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-semibold">
              {userInitials}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {userDisplayName}
              </span>
              {roleDto?.roleName && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {roleDto.roleName}
                </span>
              )}
            </div>
            <FiChevronDown
              size={16}
              className="text-gray-600 dark:text-gray-200"
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-50">
              <button
                onClick={handleViewProfile}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiUser size={16} className="mr-3" />
                View Profile
              </button>
              <button
                onClick={handleEditProfile}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiEdit size={16} className="mr-3" />
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiLogOut size={20} className="text-gray-600 dark:text-gray-200" />
        </button>
      </div>

      {/* Profile View Modal */}
      {showProfileModal && (
        <ProfileViewModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onEdit={() => {
            setShowProfileModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Profile Edit Modal */}
      {showEditModal && (
        <ProfileEditModal
          user={currentUser}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            // Refresh user data after edit
            window.location.reload();
          }}
        />
      )}
    </header>
  );
};

export default Header;
