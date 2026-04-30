import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiBell } from "react-icons/fi";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";

const TaskNotification: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const lastFetchedUserId = useRef<number | null>(null);

  // Reset ref on logout so notification fires again on next login
  useEffect(() => {
    if (!user?.userId) {
      lastFetchedUserId.current = null;
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!user?.userId || lastFetchedUserId.current === user.userId) return;
    lastFetchedUserId.current = user.userId;

    const fetchAndNotify = async () => {
      try {
        const res = await api.get("Task");
        const data: any[] = Array.isArray(res.data) ? res.data : [res.data];
        const myTasks = data.filter((t) => t.assigneeId === user.userId);
        if (myTasks.length === 0) return;

        // Use timestamp so the toast always shows fresh on each login
        const toastId = `task-login-${user.userId}-${Date.now()}`;
        toast.info(
          ({ closeToast }: any) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FiBell size={18} className="text-indigo-600 flex-shrink-0" />
                <span className="font-semibold text-gray-800 text-sm">
                  You have {myTasks.length} task{myTasks.length > 1 ? "s" : ""} assigned to you
                </span>
              </div>
              <button
                onClick={() => { closeToast(); navigate("/task-management"); }}
                className="self-start px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
              >
                View Tasks
              </button>
            </div>
          ),
          {
            toastId,
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } catch (err) {
        console.error("Error fetching task notifications:", err);
      }
    };

    fetchAndNotify();
  }, [user?.userId]);

  return null;
};

export default TaskNotification;

