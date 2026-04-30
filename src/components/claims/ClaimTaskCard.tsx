import React from "react";
import { FaEye, FaUser, FaCalendarAlt, FaDownload } from "react-icons/fa";

interface ClaimTask {
  id: number;
  claimNo: string;
  claimDate: string;
  userName: string;
  claimType: string;
  totalAmount: number;
  status: "pending" | "approved" | "rejected";
  description: string;
  priority: string;
  taskId: number;
}

interface ClaimTaskCardProps {
  claim: ClaimTask;
  onView: () => void;
  onDownload: () => void;
}

const ClaimTaskCard: React.FC<ClaimTaskCardProps> = ({ claim, onView, onDownload }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{claim.claimNo}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="View Details"
          >
            <FaEye className="text-lg" />
          </button>
          <button
            onClick={onDownload}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
            title="Download Attachments"
          >
            <FaDownload className="text-lg" />
          </button>
        </div>
      </div>

      {/* New badge removed (local-storage based badge removed; keep toast notifications) */}

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <FaUser className="mr-2 text-sm" />
          <span className="text-sm">{claim.userName}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <FaCalendarAlt className="mr-2 text-sm" />
          <span className="text-sm">{formatDate(claim.claimDate)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{claim.claimType}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            claim.priority === "High" ? "bg-red-100 text-red-800" :
            claim.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
            "bg-green-100 text-green-800"
          }`}>
            {claim.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClaimTaskCard;