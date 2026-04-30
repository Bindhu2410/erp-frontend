import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

interface TaskNotification {
  id: number;
  createdAt: string;
  updatedAt: string;
  userCreated: number | null;
  userUpdated: number | null;
  taskId: number | null;
  taskName: string;
  parentTaskId: number | null;
  description: string;
  taskType: string;
  status: string;
  priority: string;
  dueDate: string | null;
  stage: string;
  stageItemId: string;
  ownerId: number;
  assigneeId: number;
}

const PurchaseTaskNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentTask, setRecentTask] = useState<TaskNotification | null>(null); // 👈 For popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("Task");
      const procurementTasks = response.data.filter(
        (task: TaskNotification) => task.stage === "PurchaseRequisition"
      );

      // Sort tasks by created date (descending)
      const sorted = procurementTasks.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sorted);

      // 👇 Set the most recent task for popup
      if (sorted.length > 0) {
        setRecentTask(sorted[0]);
        setIsPopupOpen(true);
      }
    } catch (error) {
      toast.error("Error fetching notifications");
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "in progress":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No tasks
  if (notifications.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No pending procurement tasks
      </div>
    );
  }

  return (
    <>
      {/* 🔳 Main Notification List */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {notifications.map((task) => (
              <li
                key={task.id}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {task.taskName}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <p className="text-xs text-gray-500">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 💬 Popup for Recent Task */}
      {isPopupOpen && recentTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-lg font-bold"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              🆕 New Task
            </h2>

            <p className="text-base font-medium text-blue-600 mb-2">
              {recentTask.taskName}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              {recentTask.description}
            </p>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                  recentTask.priority
                )}`}
              >
                {recentTask.priority}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  recentTask.status
                )}`}
              >
                {recentTask.status}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Created: {new Date(recentTask.createdAt).toLocaleString()}
            </p>
            {recentTask.dueDate && (
              <p className="text-xs text-gray-500">
                Due: {new Date(recentTask.dueDate).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseTaskNotifications;
