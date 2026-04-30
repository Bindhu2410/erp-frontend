import React, { useState, useEffect } from "react";
import PurchaseTaskNotifications from "../../components/task-management/PurchaseTaskNotifications";
import Modal from "../../components/common/Modal";

const ProcurementDashboard: React.FC = () => {
  const [showTasksModal, setShowTasksModal] = useState(true);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tasks Modal */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Procurement Tasks & Notifications */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Procurement Tasks
              </h3>
              {/* <button
                onClick={() => setShowTasksModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Tasks
              </button> */}
            </div>
            <div className="border-t border-gray-200">
              <PurchaseTaskNotifications />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Procurement Summary
            </h3>
            {/* Summary content will be added here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
