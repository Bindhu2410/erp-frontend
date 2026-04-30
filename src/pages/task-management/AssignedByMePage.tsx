import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { TaskCard } from "../../pages/task-management/TaskManagementPage";

interface Task {
  id: number;
  taskName: string;
  description: string;
  taskType: string;
  status: string;
  priority: string | null;
  dueDate: string | null;
  stage: string | null;
  stageItemId: string | null;
  ownerId: number;
  assigneeId: number;
  ownerName: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: string | null;
  activityStatus?: string | null;
  activityId?: string | null;
}

const AssignedByMePage: React.FC = () => {
  const currentUserId: number | null = (() => {
    try {
      const stored = localStorage.getItem("user") || localStorage.getItem("userProfile");
      const idFromStored = stored ? JSON.parse(stored).userId : null;
      const idFromDirect = localStorage.getItem("userId");
      return idFromStored || (idFromDirect ? parseInt(idFromDirect, 10) : null);
    } catch { return null; }
  })();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("Task");
      const data: Task[] = Array.isArray(res.data) ? res.data : [res.data];
      setTasks(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Only tasks where current user is the owner
  const assignedByMe = currentUserId ? tasks.filter(t => t.ownerId === currentUserId) : [];

  // Dummy handlers for TaskCard props (no actions for owner view)
  const handleView = () => {};
  const handleApprove = () => {};
  const handleReject = () => {};
  const updatingIds: number[] = [];
  const lastSeenMaxId = 0;
  const seenIds: number[] = [];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-3">
              Tasks Assigned by Me
            </h1>
            <p className="text-gray-500 mt-1 font-medium text-sm flex items-center gap-2">
              You have <span className="text-[#FF6B35] font-semibold">{assignedByMe.length}</span> tasks assigned to others.
            </p>
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : assignedByMe.length === 0 ? (
          <div>No tasks assigned by you.</div>
        ) : (
          <div className="grid gap-4">
            {assignedByMe.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onView={handleView}
                onApprove={handleApprove}
                onReject={handleReject}
                updating={updatingIds.includes(task.id)}
                lastSeenMaxId={lastSeenMaxId}
                seenIds={seenIds}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedByMePage;
