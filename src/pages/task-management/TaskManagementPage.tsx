import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  FiList,
  FiCalendar,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertTriangle,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiActivity,
  FiPhone,
  FiUsers,
  FiStar,
  FiCheckSquare,
  FiMail,
  FiPlayCircle,
  FiDollarSign,
  FiFileText,
  FiArrowRightCircle,
  FiMessageCircle,
} from "react-icons/fi";

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

// ─── Stage config ────────────────────────────────────────────────────────────
const STAGE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; light: string; dot: string }
> = {
  All: {
    label: "All",
    color: "text-gray-700",
    bg: "bg-gray-600",
    light: "bg-gray-50 border-gray-200",
    dot: "bg-gray-400",
  },
  Lead: {
    label: "Lead",
    color: "text-blue-700",
    bg: "bg-blue-600",
    light: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  Demo: {
    label: "Demo",
    color: "text-purple-700",
    bg: "bg-purple-600",
    light: "bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
  },
  PurchaseRequisition: {
    label: "Purchase Req.",
    color: "text-orange-700",
    bg: "bg-orange-500",
    light: "bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
  },
  Claim: {
    label: "Claim",
    color: "text-rose-700",
    bg: "bg-rose-600",
    light: "bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
  },
  Quotation: {
    label: "Quotation",
    color: "text-emerald-700",
    bg: "bg-emerald-600",
    light: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Open: { bg: "bg-sky-100", text: "text-sky-700" },
  Pending: { bg: "bg-amber-100", text: "text-amber-700" },
  Accepted: { bg: "bg-indigo-100", text: "text-indigo-700" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700" },
  Completed: { bg: "bg-green-100", text: "text-green-700" },
  Approved: { bg: "bg-green-100", text: "text-green-700" },
  Rejected: { bg: "bg-red-100", text: "text-red-700" },
  Closed: { bg: "bg-gray-100", text: "text-gray-600" },
  Cancelled: { bg: "bg-gray-100", text: "text-gray-600" },
};

const PRIORITY_CONFIG: Record<string, { bg: string; text: string }> = {
  High: { bg: "bg-red-100", text: "text-red-700" },
  Medium: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Low: { bg: "bg-green-100", text: "text-green-700" },
};

const getStage = (s: string | null) => s || "Other";
const knownStages = [
  "All",
  "Lead",
  "Demo",
  "PurchaseRequisition",
  "Claim",
  "Quotation",
];

// ─── Time ago helper ──────────────────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── View modal ───────────────────────────────────────────────────────────────
const TaskViewModal: React.FC<{ task: Task; onClose: () => void }> = ({
  task,
  onClose,
}) => {
  const stage = getStage(task.stage);
  const stageConf = STAGE_CONFIG[stage] || STAGE_CONFIG["All"];
  const statusConf = STATUS_CONFIG[task.status] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  const priorityConf = task.priority ? PRIORITY_CONFIG[task.priority] : null;

  const initials = (name: string | null) =>
    name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col">
        <div className={`h-1.5 w-full ${stageConf.bg}`} />
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stageConf.light} ${stageConf.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stageConf.dot}`} />
                  {stageConf.label}
                  {task.stageItemId && <span className="opacity-60">#{task.stageItemId}</span>}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConf.bg} ${statusConf.text}`}>
                  {task.status}
                </span>
                {task.priority && priorityConf && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${priorityConf.bg} ${priorityConf.text}`}>
                    <FiAlertTriangle size={10} /> {task.priority}
                  </span>
                )}
              </div>
              <h2 className="text-sm font-semibold text-gray-900 leading-snug">{task.taskName}</h2>
            </div>
            <button onClick={onClose} className="mt-0.5 p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 text-gray-400 hover:text-gray-600">
              <FiXCircle size={18} />
            </button>
          </div>
        </div>
        <div className="border-t border-gray-100" />
        <div className="px-5 py-3 space-y-3 overflow-y-auto max-h-[60vh]">
          {task.description && (
            <div>
              <p className="text-[11px] font-semibold text-blue-500/70 uppercase tracking-widest mb-1">Description</p>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                {task.description}
              </p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-semibold text-blue-500/70 uppercase tracking-widest mb-2">Details</p>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <div>
                <p className="text-[11px] text-blue-500/70 mb-0.5 flex items-center gap-1"><FiTag size={10} /> Task Type</p>
                <p className="text-xs font-medium text-gray-800">{task.taskType}</p>
              </div>
              {task.dueDate && (
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5 flex items-center gap-1"><FiCalendar size={10} /> Due Date</p>
                  <p className="text-xs font-semibold text-gray-800">{new Date(task.dueDate).toLocaleDateString("en-GB")}</p>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-100" />
          <div>
            <p className="text-[11px] font-semibold text-blue-500/70 uppercase tracking-widest mb-2">People</p>
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Assignee</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-semibold">{initials(task.assigneeName || task.ownerName)}</div>
                  <span className="text-xs font-semibold text-gray-800 truncate">{task.assigneeName || task.ownerName}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Owner</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">{initials(task.ownerName)}</div>
                  <span className="text-xs font-semibold text-gray-800 truncate">{task.ownerName}</span>
                </div>
              </div>
            </div>
          </div>
          {task.comments && (
            <div className="mt-3 bg-rose-50 border border-rose-100 rounded-lg px-4 py-3">
              <p className="text-[11px] font-semibold text-blue-500/70 uppercase tracking-widest mb-1">Comment</p>
              <p className="text-xs text-rose-700">{task.comments}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Reject modal ─────────────────────────────────────────────────────────────
const RejectModal: React.FC<{ onClose: () => void; onConfirm: (reason: string) => void; }> = ({ onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Reject Task</h3>
        <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection.</p>
        <textarea
          className="w-full border rounded-lg p-3 h-28 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="Enter rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onConfirm(reason)} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm hover:bg-rose-700">Reject</button>
        </div>
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────────────
export const TaskCard: React.FC<{
  task: Task;
  onView: (t: Task) => void;
  onApprove: (t: Task, status: string) => void;
  onReject: (t: Task) => void;
  updating: boolean;
  lastSeenMaxId: number;
  seenIds: number[];
  currentUserId: number | null;
}> = ({ task, onView, onApprove, onReject, updating, lastSeenMaxId, seenIds, currentUserId }) => {
  // Show NEW badge for tasks created within the last 30 minutes
  const isNew = (() => {
    const created = new Date(task.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return diffMs < 30 * 60 * 1000; // 30 minutes
  })();
  const stage = getStage(task.stage);
  const stageConf = STAGE_CONFIG[stage] || STAGE_CONFIG["All"];
  const statusConf = STATUS_CONFIG[task.status] || { bg: "bg-gray-100", text: "text-gray-600" };
  const priorityConf = task.priority ? PRIORITY_CONFIG[task.priority] : null;

  const getActivityIcon = () => {
    const name = task.taskName.toLowerCase();
    if (name.includes("call")) return <FiPhone className="text-blue-600" />;
    if (name.includes("meeting") || name.includes("visit")) return <FiUsers className="text-purple-600" />;
    if (name.includes("event") || name.includes("expo")) return <FiStar className="text-amber-500" />;
    if (name.includes("mail") || name.includes("email")) return <FiMail className="text-sky-500" />;
    if (name.includes("demo")) return <FiPlayCircle className="text-indigo-500" />;
    if (name.includes("pay") || name.includes("invoice") || name.includes("cash")) return <FiDollarSign className="text-emerald-600" />;
    if (name.includes("document") || name.includes("file") || name.includes("paper")) return <FiFileText className="text-rose-500" />;
    if (name.includes("follow") || name.includes("up")) return <FiArrowRightCircle className="text-orange-500" />;
    if (name.includes("msg") || name.includes("whatsapp") || name.includes("chat")) return <FiMessageCircle className="text-green-500" />;
    return <FiCheckCircle className="text-gray-400" />;
  };

  const isActivityLinked = !!task.activityId;
  const initials = (name: string | null) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div
      onClick={() => onView(task)}
      className={`relative ${stageConf.light} rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-200 p-4 cursor-pointer ${isNew ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
    >
      {/* New badge */}
      {isNew && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow">NEW</span>
      )}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-white/80 shadow-sm">
              {getActivityIcon()}
            </div>
            <h3 className="text-sm font-semibold text-gray-800 truncate leading-snug">{task.taskName}</h3>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${stageConf.bg} text-white shadow-sm uppercase tracking-tighter`}>
            {stageConf.label}
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${statusConf.bg} ${statusConf.text} uppercase border border-white/50 shadow-sm`}>
          {task.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-[11px] text-gray-500">
        {task.dueDate && <span className="flex items-center gap-1"><FiCalendar size={11} /> {new Date(task.dueDate).toLocaleDateString("en-GB")}</span>}
        <span className="flex items-center gap-1"><FiClock size={11} /> {timeAgo(task.createdAt)}</span>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-semibold">{initials(task.assigneeName || task.ownerName)}</div>
          <span className="text-[11px] text-gray-500 font-semibold truncate max-w-[80px]">{task.assigneeName || "Unassigned"}</span>
        </div>

        <div className="flex gap-2">
          {/* Only show buttons if current user is NOT the task owner */}
          {currentUserId !== task.ownerId && (
            <>
              {/* Approve/Reject for all tasks with status 'Open' */}
              {task.status?.toLowerCase().trim() === "open" && (
                <>
                  <button
                    disabled={updating}
                    onClick={e => { e.stopPropagation(); onApprove(task, "Approve"); }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    disabled={updating}
                    onClick={e => { e.stopPropagation(); onReject(task); }}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 disabled:opacity-50 transition-all shadow-sm"
                  >
                    Reject
                  </button>
                </>
              )}
              {/* Default Accept/Reject for other tasks */}
              {task.assigneeId === currentUserId && task.assigneeId !== task.ownerId && (
                <>
                  {task.status === "Pending" && (
                    <>
                      <button disabled={updating} onClick={(e) => { e.stopPropagation(); onApprove(task, "Accepted"); }} className="px-3 py-1 rounded-lg bg-[#FF6B35] text-white text-[11px] font-semibold hover:bg-[#e85a24] disabled:opacity-50 transition-all shadow-sm">Accept</button>
                      <button disabled={updating} onClick={(e) => { e.stopPropagation(); onReject(task); }} className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 disabled:opacity-50 transition-all shadow-sm">Reject</button>
                    </>
                  )}
                  {task.status === "Accepted" && (
                    <>
                      {!isActivityLinked && (
                        <button
                          disabled={updating}
                          onClick={(e) => { e.stopPropagation(); onApprove(task, "Completed"); }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        disabled={updating}
                        onClick={(e) => { e.stopPropagation(); onReject(task); }}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 disabled:opacity-50 transition-all shadow-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {task.activityStatus && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[9px] text-blue-500/70 font-semibold uppercase">Activity Status</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${STATUS_CONFIG[task.activityStatus]?.bg || 'bg-gray-50'} ${STATUS_CONFIG[task.activityStatus]?.text || 'text-gray-400'}`}>{task.activityStatus}</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TaskManagementPage: React.FC = () => {
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
  const [activeStage, setActiveStage] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [rejectTarget, setRejectTarget] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [seenIds, setSeenIds] = useState<number[]>(() => {
    try { const s = localStorage.getItem("seenTaskIds"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [lastSeenMaxId, setLastSeenMaxId] = useState<number>(() => {
    const s = localStorage.getItem("lastSeenMaxId"); return s ? parseInt(s, 10) : 0;
  });

  const handleView = (task: Task) => {
    if (!seenIds.includes(task.id)) {
      const updated = [...seenIds, task.id];
      setSeenIds(updated);
      localStorage.setItem("seenTaskIds", JSON.stringify(updated));
    }
    setViewTask(task);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("Task");
      const data: Task[] = Array.isArray(res.data) ? res.data : [res.data];
      setTasks(data);
      setLastSeenMaxId(prev => {
        const stored = localStorage.getItem("lastSeenMaxId");
        const current = stored ? parseInt(stored, 10) : 0;
        if (current === 0) {
          const m = Math.max(...data.map(t => t.id), 0);
          localStorage.setItem("lastSeenMaxId", String(m)); return m;
        }
        return current;
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Show tasks for both assignee and owner - owners should see all their tasks regardless of status
  const myTasks = currentUserId ? tasks.filter(t => t.assigneeId === currentUserId || t.ownerId === currentUserId) : tasks;
  const filtered = myTasks.filter(t => {
    const sm = activeStage === "All" || getStage(t.stage) === activeStage;
    const sem = !search || t.taskName.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
    return sm && sem;
  });

  const awaitingAction = filtered.filter(t => t.status === "Pending");
  const inProgress = filtered.filter(t => ["Accepted", "Open", "In Progress"].includes(t.status));
  const finalized = filtered.filter(t => ["Completed", "Approved", "Rejected", "Done", "Closed"].includes(t.status));

  const updateStatus = async (task: Task, newStatus: string, comments?: string) => {
    setUpdatingIds(p => [...p, task.id]);
    try {
      await api.put(`Task/${task.id}/status`, { status: newStatus, comments });
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-sm">Status Updated</span>
          <span className="text-xs opacity-90 leading-tight">
            Task <span className="font-semibold italic">"{task.taskName}"</span> moved to <span className="uppercase tracking-tighter">{newStatus}</span>.
          </span>
          <span className="text-[10px] mt-1 text-emerald-800 flex items-center gap-1">
            <FiUsers size={10} /> {task.assigneeName || task.ownerName || "Unassigned"}
          </span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          style: { borderRadius: '0.5rem' }
        }
      );
      await fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error(`Could not update task "${task.taskName}". Please try again.`);
      await fetchTasks();
    } finally {
      setUpdatingIds(p => p.filter(id => id !== task.id));
    }
  };

  const Column: React.FC<{ title: string; count: number; items: Task[]; colorClass: string }> = ({ title, count, items, colorClass }) => (
    <div className="flex flex-col gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100 min-h-[500px]">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colorClass}`} />
          <h2 className={`font-semibold ${colorClass.replace('bg-', 'text-')} opacity-90 text-[11px] uppercase tracking-widest`}>{title}</h2>
        </div>
        <span className="bg-white border text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">{count}</span>
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300 border-2 border-dashed border-gray-100 rounded-lg">
            <FiCheckSquare size={32} className="mb-2 opacity-20" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">No tasks</span>
          </div>
        ) : items.map(t => (
          <TaskCard key={t.id} task={t} onView={handleView} onApprove={updateStatus} onReject={setRejectTarget} updating={updatingIds.includes(t.id)} lastSeenMaxId={lastSeenMaxId} seenIds={seenIds} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <FiCheckSquare className="text-[#FF6B35]" size={24} />
              Task Center
            </h1>
            <p className="text-gray-500 mt-1 font-medium text-sm flex items-center gap-2">
              You have <span className="text-[#FF6B35] font-semibold">{awaitingAction.length}</span> tasks awaiting your action.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] transition-all w-64 shadow-sm"
              />
            </div>
            <button onClick={fetchTasks} className={`p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-[#FF6B35] transition-all ${loading ? 'animate-spin' : ''}`}><FiRefreshCw size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active", value: inProgress.length, icon: FiActivity, color: "text-blue-700", bg: "bg-blue-100" },
            { label: "Pending", value: awaitingAction.length, icon: FiClock, color: "text-amber-700", bg: "bg-amber-100" },
            { label: "Completed", value: finalized.length, icon: FiCheckCircle, color: "text-emerald-700", bg: "bg-emerald-100" },
            { label: "Critical", value: tasks.filter(t => t.priority === "High").length, icon: FiAlertTriangle, color: "text-rose-700", bg: "bg-rose-100" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} p-4 rounded-lg border border-white/50 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-all duration-300`}>
              <div>
                <div className={`text-base uppercase font-semibold ${s.color} opacity-80 tracking-widest mb-0.5`}>{s.label}</div>
                <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
              </div>
              <div className={`p-3 rounded-lg bg-white/60 ${s.color} shadow-sm group-hover:rotate-12 transition-transform`}><s.icon size={22} /></div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto p-4 scrollbar-hide mb-4">
          {["All", ...knownStages.filter(s => s !== "All")].map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap mx-0.5 ${activeStage === s
                  ? "bg-[#FF6B35] text-white shadow-lg shadow-orange-200/50 scale-110 -translate-y-0.5"
                  : "bg-white text-gray-500 hover:text-gray-700 border border-gray-100 hover:border-gray-200"
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Column title="Needs Action" count={awaitingAction.length} items={awaitingAction} colorClass="bg-amber-500" />
          <Column title="In Progress" count={inProgress.length} items={inProgress} colorClass="bg-[#FF6B35]" />
          <Column title="Finalized" count={finalized.length} items={finalized} colorClass="bg-emerald-500" />
        </div>
      </div>

      {rejectTarget && <RejectModal onClose={() => setRejectTarget(null)} onConfirm={reason => updateStatus(rejectTarget, "Rejected", reason)} />}
      {viewTask && <TaskViewModal task={viewTask} onClose={() => setViewTask(null)} />}
    </div>
  );
};

export default TaskManagementPage;

