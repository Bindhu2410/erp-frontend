import React, { useState, useEffect } from "react";
import PopUp from "./PopUp";
import Modal from "./Modal";
import { useUser } from "../../context/UserContext";

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (status: string, comments: string, assignedTo: any) => void;
  statusOptions: string[];
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  statusOptions,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [comments, setComments] = useState("");
  const [tempStatus, setTempStatus] = useState("");
  const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState<any>(null);
  const { user, role } = useUser();
  useEffect(() => {
    const fetchAssignedToOptions = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/SalesLead/assigned-to-dropdown?userId=${user?.userId}`
        );
        const data = await response.json();
        setAssignedToOptions(data || []);
      } catch (err) {
        setAssignedToOptions([]);
      }
    };
    fetchAssignedToOptions();
  }, []);

  const handleStatusClick = (status: string) => {
    setTempStatus(status);
    setIsPopupOpen(true);
  };

  const handleSave = () => {
    // Pass assignedTo object to parent (add as third argument)
    onStatusChange(tempStatus, comments, assignedTo);
    setIsPopupOpen(false);
    setComments("");
    setSelectedStatus(tempStatus);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
      "On Hold": "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  return (
    <div className="relative">
      {/* Custom Styled Dropdown */}
      <div className="relative">
        <select
          className="w-full appearance-none px-4 py-3 pr-10 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 cursor-pointer text-gray-700 font-medium transition-all duration-200"
          value={selectedStatus}
          onChange={(e) => handleStatusClick(e.target.value)}
        >
          <option value={selectedStatus}>{selectedStatus}</option>
          {statusOptions
            .filter((status) => status !== selectedStatus)
            .map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
        </select>

        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isPopupOpen && (
        <Modal
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          title="Update Status"
        >
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Status Update
              </h3>
              <p className="text-gray-600">
                Confirm your status change and add any relevant comments
              </p>
            </div>

            {/* Status Transition Display */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Current Status
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                      selectedStatus
                    )}`}
                  >
                    {selectedStatus}
                  </div>
                </div>

                <div className="px-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    New Status
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                      tempStatus
                    )}`}
                  >
                    {tempStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned To Section */}
            {tempStatus === "Negotiation" && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Assigned To
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white"
                  value={assignedTo?.userId || ""}
                  onChange={(e) => {
                    const selected = assignedToOptions.find(
                      (opt) => String(opt.userId) === e.target.value
                    );
                    setAssignedTo(selected || null);
                  }}
                >
                  <option value="">Select</option>
                  {assignedToOptions.map((opt) => (
                    <option key={opt.userId} value={opt.userId}>
                      {opt.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Comments Section */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Add Comments
                  <span className="text-red-500 ml-1">*</span>
                </div>
              </label>
              <div className="relative">
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 resize-none transition-all duration-200 bg-white"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Please provide detailed comments about this status change..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {comments.length}/500
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 text-orange-400 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Comments are required to proceed with the status update
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                className=" px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg disabled:shadow-none"
                onClick={handleSave}
                disabled={!comments.trim()}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update Status
                </div>
              </button>

              <button
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-100"
                onClick={() => setIsPopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StatusDropdown;
