import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-lg font-bold">
              Inventory Management System
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Link
                to="/Dashboard"
                className="text-white px-3 py-2 rounded-md text-sm font-medium bg-gray-900"
              >
                Dashboard
              </Link>

              <div className="relative group">
                <button className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Master Data
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition ease-out duration-100 transform origin-top-left z-10">
                  <div className="py-1">
                    <Link
                      to="/item-master"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Item Master
                    </Link>
                    <Link
                      to="/location-master"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Location Master
                    </Link>
                    <Link
                      to="/uom-master"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      UOM Master
                    </Link>
                    <Link
                      to="/bom-master"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      BOM Master
                    </Link>
                  </div>
                </div>
              </div>

              {/* More dropdown menus would follow the same pattern */}
              <div className="relative group">
                <button className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Inventory Transactions
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition ease-out duration-100 transform origin-top-left z-10">
                  <div className="py-1">
                    <Link
                      to="/goods-receipt"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Goods Receipt (PO)
                    </Link>
                    {/* ...other links... */}
                  </div>
                </div>
              </div>

              {/* Additional dropdowns would be added here */}
            </div>
          </div>

          <div className="ml-auto flex items-center">
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-3">
                <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  User
                </button>
                <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white inline-flex items-center justify-center p-2 rounded-md"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="text-white block px-3 py-2 rounded-md text-base font-medium bg-gray-900"
            >
              Dashboard
            </Link>

            {/* Mobile menu items would be expanded here */}
            <button className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">
              Master Data
            </button>

            <button className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">
              Inventory Transactions
            </button>

            {/* Additional mobile menu items... */}

            <div className="border-t border-gray-700 pt-4 pb-3">
              <div className="flex items-center px-3">
                <div className="text-white text-base font-medium">
                  User Options
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                  User Profile
                </button>
                <button className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
