import React from "react";
import { Link } from "react-router-dom";

interface AlertItem {
  id: number;
  title: string;
  subtitle: string;
  status: string;
  badgeType: string;
}

interface AlertCardProps {
  title: string;
  icon: string;
  iconColor: string;
  count: number;
  items: AlertItem[];
  borderColor: string;
  countBackground: string;
  footerLink: string;
  footerText: string;
}

const AlertCard: React.FC<AlertCardProps> = ({
  title,
  icon,
  iconColor,
  count,
  items,
  borderColor,
  countBackground,
  footerLink,
  footerText,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "exclamation-circle":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "truck-loading":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        );
      case "clipboard-list":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className={`flex justify-between items-center px-6 py-4 border-b border-gray-200 border-l-4 ${borderColor}`}
      >
        <h3 className="flex items-center gap-2 font-semibold text-gray-800">
          <span className={iconColor}>{renderIcon()}</span>
          {title}
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${countBackground}`}
          >
            {count}
          </span>
        </h3>
      </div>
      <div className="px-6 py-2 max-h-[300px] overflow-y-auto">
        {items.map((item) => (
          <Link
            to="#"
            key={item.id}
            className="block hover:bg-gray-50 transition duration-150"
          >
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500">{item.subtitle}</div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${getBadgeColor(
                  item.badgeType
                )}`}
              >
                {item.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-gray-200 text-center">
        <Link
          to={footerLink}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {footerText}
          <svg
            className="w-4 h-4 inline-block ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default AlertCard;
