import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import api from "../../../services/api";
import { FaTasks, FaList } from "react-icons/fa";
import { FiPrinter } from "react-icons/fi";

import {
  FaCalendar as Calendar,
  FaTag as Tag,
  FaUser as UserIcon,
  FaFlag as Flag,
  FaClock as Clock,
  FaSearch as Search,
  FaFilter as Filter,
  FaChevronDown as ChevronDown,
} from "react-icons/fa";

import { LuMoreVertical as MoreVertical } from "react-icons/lu";

interface Task {
  id: number;
  taskId: number | null;
  taskName: string;
  description: string;
  taskType: string;
  status: string;
  comments?: string | null;
  priority: string;
  dueDate: string | null;
  stage: string | null;
  stageItemId: string | null;
  ownerId: number;
  assigneeId: number;
  createdAt: string;
  updatedAt: string;
  userCreated: number | null;
  userUpdated: number | null;
  parentTaskId: number | null;
  ownerName: string | null;
  assigneeName: string | null;
}

const statusConfig: Record<string, { bg: string; text?: string; dot?: string }> = {
  Open: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  Pending: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  "In Progress": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  Completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  Cancelled: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" },
  Approved: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  Rejected: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
};

const priorityConfig: Record<string, { bg: string; light?: string; text?: string; border?: string }> = {
  High: {
    bg: "bg-gradient-to-br from-rose-400 to-rose-600",
    light: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
  },
  Medium: {
    bg: "bg-gradient-to-br from-yellow-200 to-yellow-400",
    light: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-100",
  },
  Low: {
    bg: "bg-gradient-to-br from-green-300 to-green-500",
    light: "bg-green-50",
    text: "text-green-700",
    border: "border-green-100",
  },
};

const TaskManagement: React.FC<{ stage?: string }> = ({ stage }) => {
  const { user } = useUser();
  // Sample task used to bind the provided response when API returns empty
  const sampleTask: Task = {
    id: 63,
    taskId: null,
    taskName: "Approve Purchase Requisition: PR/25-26/11",
    description: "New PR",
    taskType: "Main",
    status: "Pending",
    priority: "Medium",
    dueDate: null,
    stage: "PurchaseRequisition",
    stageItemId: "11",
    ownerId: 1,
    assigneeId: 2,
    createdAt: "2025-10-03T09:59:05.382904",
    updatedAt: "2025-10-03T09:59:05.382904",
    userCreated: null,
    userUpdated: null,
    parentTaskId: null,
    ownerName: null,
    assigneeName: null,
  };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "assigned">("all");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // view: 'card' shows the existing cards; 'list' shows a table with checkboxes
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [usernameFilter, setUsernameFilter] = useState<string>("");
  const [claimMap, setClaimMap] = useState<Record<string, any>>({});
  const [claimLoading, setClaimLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  const fetchTasks = async (page: number) => {
    setLoading(true);
    try {
      // If stage prop is provided, fetch only tasks with that stage
      let endpoint = "Task";
      let stageParam: string | undefined = undefined;
      if (stage) {
        // normalize stage to expected backend value: singular, capitalized (e.g., 'claims' -> 'Claim')
        stageParam = stage.trim().toLowerCase();
        if (stageParam.endsWith("s")) stageParam = stageParam.slice(0, -1);
        stageParam = stageParam.charAt(0).toUpperCase() + stageParam.slice(1);
        endpoint = `Task?stage=${encodeURIComponent(stageParam)}`;
      }

      const response = await api.get(endpoint);
      const data = response.data;

      let tasksList: any[] = [];

      if (Array.isArray(data)) {
        tasksList = data;
      } else if (data && typeof data === "object") {
        tasksList = [data]; // wrap single object as array
      }

      // Client-side filter as backup (in case backend doesn't support stage query param)
      const filterStage = stageParam ? stageParam.toLowerCase() : stage ? stage.toLowerCase() : undefined;
      const filteredTasks = filterStage
        ? tasksList.filter((task) => task.stage?.toLowerCase() === filterStage)
        : tasksList;

      setTasks(filteredTasks);
      setTotalTasks(filteredTasks.length);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      setTotalTasks(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(currentPage);
  }, [activeTab, currentPage, user?.userId, stage]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAssigneeName = (task: Task) => {
    return task.assigneeName || task.ownerName || "Unassigned";
  };

  const getDisplayUserName = (task: Task) => {
    // Prefer explicit task.userName, then claim.userName (if claim loaded), then assignee/owner
    const tUser = (task as any).userName;
    if (tUser) return tUser;
    if (task.stage && task.stage.toLowerCase().includes("claim") && task.stageItemId) {
      const c = claimMap[task.stageItemId];
      if (c && (c as any).userName) return (c as any).userName;
    }
    return task.assigneeName || task.ownerName || "-";
  };

  const getTaskAmount = (task: Task) => {
    // Prefer claim value if available
    if (task.stage && task.stage.toLowerCase().includes("claim") && task.stageItemId) {
      const c = claimMap[task.stageItemId];
      if (c) {
        // claim may have an explicit amount or expenses array
        const val = (c as any).amount ?? (c as any).totalAmount ?? null;
        if (val !== null && val !== undefined && val !== "") {
          const n = Number(val);
          if (!isNaN(n)) return `₹${n.toFixed(2)}`;
          return String(val);
        }
        // sum expenses if present
        const knownExpenseArrays = ["expenses", "expenseRows", "expenseDetails", "claimExpenses", "items", "expensesList", "details"];
        for (const k of knownExpenseArrays) {
          if (Array.isArray((c as any)[k]) && (c as any)[k].length) {
            const sum = (c as any)[k].reduce((s: number, e: any) => s + Number(e.amount ?? e.totalAmount ?? e.value ?? 0), 0);
            return `₹${sum.toFixed(2)}`;
          }
        }
      }
    }

    const v = (task as any).amount ?? (task as any).totalAmount ?? (task as any).claimAmount ?? null;
    if (v === null || v === undefined || v === "") return "-";
    const num = Number(v);
    if (isNaN(num)) return String(v);
    return `₹${num.toFixed(2)}`;
  };

  const getTaskType = (task: Task) => {
    if (task.stage && task.stage.toLowerCase().includes("claim") && task.stageItemId) {
      const c = claimMap[task.stageItemId];
      if (c) return (c as any).claimType ?? (c as any).expenseType ?? (c as any).type ?? task.taskType ?? task.stage ?? "-";
    }
    return (task as any).expenseType ?? (task as any).type ?? task.taskType ?? task.stage ?? "-";
  };

  // Fetch claim details for tasks that reference claims and cache them by stageItemId
  const fetchClaimsForTasks = async (taskList: Task[]) => {
    const ids = Array.from(
      new Set(
        taskList
          .filter((t) => t.stage && t.stage.toLowerCase().includes("claim") && t.stageItemId)
          .map((t) => (t.stageItemId as string).trim())
      )
    ).filter(Boolean);
    // remove ids we already have
    const toFetch = ids.filter((id) => !claimMap[id]);
    if (!toFetch.length) return;
    setClaimLoading(true);
    try {
      const fetches = toFetch.map(async (id) => {
        try {
          const res = await api.getById("Claims", id);
          return { id, data: res.data };
        } catch (err) {
          try {
            const resp = await fetch(`${process.env.REACT_APP_API_BASE_URL}Claims/${id}`);
            if (resp.ok) return { id, data: await resp.json() };
          } catch (e) {
            /* ignore */
          }
          return { id, data: null };
        }
      });

      const results = await Promise.all(fetches);
      const mapUpdate: Record<string, any> = {};
      results.forEach((r) => {
        if (r && r.id) mapUpdate[r.id] = r.data;
      });
      setClaimMap((prev) => ({ ...prev, ...mapUpdate }));
      // eslint-disable-next-line no-console
      console.log('[TaskManagement] fetched claim details for', Object.keys(mapUpdate));
    } finally {
      setClaimLoading(false);
    }
  };

  const handleExport = (format: string) => {
    console.log("Exporting in format:", format);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const applyFilters = (tasksArr: Task[]) => {
    let result = tasksArr;
    if (searchInput.trim()) {
      const q = searchInput.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.taskName.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    if (filterStatus && filterStatus !== "All") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Username filter
    if (usernameFilter && usernameFilter.trim() !== "") {
      const q = usernameFilter.trim().toLowerCase();
      result = result.filter((t) => {
        const username = getDisplayUserName(t).toLowerCase();
        return username.includes(q);
      });
    }

    // Date range filter: uses task.dueDate if available, otherwise falls back to createdAt
    if ((fromDate && fromDate.trim() !== "") || (toDate && toDate.trim() !== "")) {
      const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
      const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
      result = result.filter((t) => {
        const dateStr = t.dueDate ?? t.createdAt;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }

    return result;
  };

  const updateTaskStatus = async (task: Task, newStatus: string) => {
    const original = { ...task };
    // mark as updating to disable buttons
    setUpdatingIds((prev) => [...prev, task.id]);
    const payload = { ...task, status: newStatus, Status: newStatus };
    try {
      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
      // Persist change and use server response to keep canonical state
      // Debug: log the outgoing payload
      // eslint-disable-next-line no-console
      console.log(`[TaskManagement] PUT Task/${task.id}`, payload);
      const res = await api.put(`Task/${task.id}`, payload);
      const updated = res?.data ?? { ...task, status: newStatus };
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch (err: any) {
      // Log and surface server-provided error if any
      // eslint-disable-next-line no-console
      console.error("Failed to update task status:", err);
      // If the Task endpoint is not found, try SalesActivityTask as fallback
      if (err && (err.is404 || err.status === 404)) {
        try {
          const fallback = await api.put(`SalesActivityTask/${task.id}`, payload);
          const updated = fallback?.data ?? payload;
          setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
          return;
        } catch (fbErr) {
          // eslint-disable-next-line no-console
          console.error('Fallback update to SalesActivityTask failed:', fbErr);
        }
      }

      const serverMessage = err?.data ?? err?.message ?? err?.statusText ?? String(err);
      // Revert
      setTasks((prev) => prev.map((t) => (t.id === original.id ? original : t)));
      alert(`Failed to update task status. ${typeof serverMessage === 'object' ? JSON.stringify(serverMessage) : serverMessage}`);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== task.id));
    }
  };

  const toggleSelectTask = (id: number) => {
    setSelectedTaskIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const openRejectModal = (taskId: number) => {
    const t = tasks.find((x) => x.id === taskId);
    setRejectReason(t?.comments || "");
    setRejectTarget(taskId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setRejectTarget(null);
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    // Optimistic update: set status and comments locally
    const original = tasks.find((t) => t.id === rejectTarget);
    setUpdatingIds((prev) => [...prev, rejectTarget]);
    const payload = { ...(original as any), status: 'Rejected', Status: 'Rejected', comments: rejectReason, Comments: rejectReason };
    try {
      setTasks((prev) => prev.map((t) => (t.id === rejectTarget ? { ...t, status: 'Rejected', comments: rejectReason } : t)));
      // eslint-disable-next-line no-console
      console.log(`[TaskManagement] PUT Task/${rejectTarget}`, payload);
      const res = await api.put(`Task/${rejectTarget}`, payload);
      const updated = res?.data ?? payload;
      setTasks((prev) => prev.map((t) => (t.id === rejectTarget ? { ...t, ...updated } : t)));
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to reject task with comment', err);
      // attempt fallback to SalesActivityTask if 404
      if (err && (err.is404 || err.status === 404)) {
        try {
          const fallback = await api.put(`SalesActivityTask/${rejectTarget}`, payload);
          const updated = fallback?.data ?? payload;
          setTasks((prev) => prev.map((t) => (t.id === rejectTarget ? { ...t, ...updated } : t)));
          return;
        } catch (fbErr) {
          // eslint-disable-next-line no-console
          console.error('Fallback update to SalesActivityTask failed:', fbErr);
        }
      }

      const serverMessage = err?.data ?? err?.message ?? err?.statusText ?? String(err);
      // revert
      if (original) setTasks((prev) => prev.map((t) => (t.id === original.id ? original : t)));
      alert(`Failed to reject the task. ${typeof serverMessage === 'object' ? JSON.stringify(serverMessage) : serverMessage}`);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== rejectTarget));
      closeRejectModal();
    }
  };

  // derived list after filters
  const displayedTasks = applyFilters(tasks);

  useEffect(() => {
    if (tasks && tasks.length) fetchClaimsForTasks(tasks);
  }, [tasks]);

  const hasClaimSelected = selectedTaskIds.some((id) => {
    const t = tasks.find((x) => x.id === id);
    return !!(t && t.stage && t.stage.toLowerCase().includes("claim") && t.stageItemId);
  });

  const approveSelected = () => {
    selectedTaskIds.forEach((id) => {
      const t = tasks.find((x) => x.id === id);
      if (t) updateTaskStatus(t, "Approved");
    });
    setSelectedTaskIds([]);
    setSelectAll(false);
  };

  const rejectSelected = () => {
    selectedTaskIds.forEach((id) => {
      const t = tasks.find((x) => x.id === id);
      if (t) updateTaskStatus(t, "Rejected");
    });
    setSelectedTaskIds([]);
    setSelectAll(false);
  };

  const openClaimPreview = async (stageItemId?: string | null) => {
    if (!stageItemId) return;
    let claim: any = null;
    try {
      const res = await api.getById("Claims", stageItemId);
      claim = res.data;
    } catch (err) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}Claims/${stageItemId}`);
        if (response.ok) claim = await response.json();
      } catch (e) {
        console.error("Failed to fetch claim for print preview:", e);
      }
    }


    if (!claim) {
      alert("Claim details not found for printing.");
      return;
    }

    // helper to pick first available key from a set of possible keys
    const pick = (obj: any, keys: string[]) => {
      if (!obj) return null;
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
      }
      return null;
    };

    // Normalize expenses array: backend may use different property names
    const knownExpenseArrays = [
      "expenses",
      "expenseRows",
      "expenseDetails",
      "claimExpenses",
      "items",
      "expensesList",
      "details",
    ];
    let expenses: any[] = [];
    for (const key of knownExpenseArrays) {
      if (Array.isArray((claim as any)[key])) {
        expenses = (claim as any)[key];
        break;
      }
    }
    // If no array found, attempt to build a single-row array from top-level fields
    if (!expenses.length) {
      const maybeAmount = pick(claim, ["amount", "totalAmount", "total", "Amount"]);
      if (maybeAmount !== null) {
        expenses = [claim];
      }
    }
    const rowsHtml = expenses.length
      ? expenses
          .map((exp: any) => {
            const desc = pick(exp, ["expensesName", "remarks", "description"]) || "-";
            const from = pick(exp, ["fromPlace", "from", "from_place"]) || "-";
            const to = pick(exp, ["toPlace", "to", "to_place"]) || "-";
            const mode = pick(exp, ["modeOfTravel", "mode_of_travel"]) || pick(claim, ["modeOfTravel"]) || "-";
            const type = pick(exp, ["expenseType", "type"]) || pick(claim, ["claimType"]) || "-";
            const km = exp.totalKM ?? exp.actualKm ?? exp.km ?? "-";
            const amount = Number(exp.amount ?? exp.totalAmount ?? 0).toFixed(2);
            return `<tr>
                      <td>${desc}</td>
                      <td>${from}</td>
                      <td>${to}</td>
                      <td>${mode}</td>
                      <td>${type}</td>
                      <td>${km}</td>
                      <td>₹${amount}</td>
                    </tr>`;
          })
          .join("")
      : `<tr>
           <td>${pick(claim, ["comments", "remarks", "description"]) || "-"}</td>
           <td>${pick(claim, ["fromPlace", "from", "origin"]) || "-"}</td>
           <td>${pick(claim, ["toPlace", "to", "destination"]) || "-"}</td>
           <td>${pick(claim, ["modeOfTravel", "mode_of_travel"]) || "-"}</td>
           <td>${pick(claim, ["expenseType", "type"]) || "-"}</td>
           <td>${pick(claim, ["actualKm", "totalKM"]) ?? "-"}</td>
           <td>₹${Number(pick(claim, ["amount", "totalAmount"]) ?? 0).toFixed(2)}</td>
         </tr>`;

    const totalAmount = Number(pick(claim, ["amount", "totalAmount"]) ?? 0) || (expenses.length ? expenses.reduce((s: number, e: any) => s + Number(pick(e, ["amount", "totalAmount", "value"]) ?? 0), 0) : 0);

    const html = `
      <html>
        <head>
          <title>Claim Preview - ${claim.claimNo || "-"}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 20px; }
            .header { display:flex; justify-content:space-between; align-items:center; gap:12px }
            .company { font-size: 18px; font-weight: bold; }
            .meta { margin-top: 6px; font-size: 13px; color: #333; }
            .section { margin-top: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 13px; }
            th { background: #f3f4f6; text-align: left; }
            .totals { text-align: right; font-weight: bold; }
            .no-print { display: inline-block; margin-left: 12px; padding: 8px 12px; background:#2563eb; color:white; border-radius:6px; text-decoration:none }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">JBS Meditech India Pvt. Ltd.</div>
              <div class="meta">Claim Print Format (Preview)</div>
            </div>
            <div>
              <a href="#" class="no-print" onclick="window.print();return false;">Print</a>
            </div>
          </div>

          <div class="section">
            <strong>Claim No:</strong> ${claim.claimNo || "-"}<br/>
            <strong>Date:</strong> ${claim.claimDate ? new Date(claim.claimDate).toLocaleDateString() : "-"}<br/>
            <strong>User:</strong> ${claim.userName || "-"}
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Mode</th>
                  <th>Type</th>
                  <th>KM</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div class="section totals">Total Amount: ₹${totalAmount.toFixed(2)}</div>

          <div style="margin-top:40px; font-size:12px; color:#666">Preview generated on: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      alert("Unable to open preview window (blocked by browser). Please allow popups for this site.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const openBatchClaimPreview = async () => {
    // collect unique claim ids from selected tasks (stageItemId)
    const claimIds = selectedTaskIds
      .map((id) => tasks.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => (t as Task).stageItemId)
      .filter((s): s is string => !!s && s.trim() !== "");

    const uniqueIds = Array.from(new Set(claimIds));
    if (uniqueIds.length === 0) {
      alert("No claim items found in selected tasks to print.");
      return;
    }

    // fetch all claims in parallel
    const fetches = uniqueIds.map(async (sid) => {
      try {
        const res = await api.getById("Claims", sid);
        return res.data;
      } catch (err) {
        try {
          const resp = await fetch(`${process.env.REACT_APP_API_BASE_URL}Claims/${sid}`);
          if (resp.ok) return await resp.json();
        } catch (e) {
          /* ignore */
        }
        return null;
      }
    });

    const results = await Promise.all(fetches);
    const claims = results.filter(Boolean) as any[];
    const missing = uniqueIds.length - claims.length;
    if (claims.length === 0) {
      alert("No claim details could be fetched for the selected items.");
      return;
    }

    if (missing > 0) {
      // Notify user missing some claims
      // We proceed with what we have
      // eslint-disable-next-line no-alert
      alert(`${missing} selected claim(s) could not be found and will be skipped.`);
    }

    // build HTML for multiple claims (each on its own page)
    // Debug: log fetched claims for batch print to inspect field names
    // eslint-disable-next-line no-console
    console.log("[TaskManagement] claims fetched for batch preview:", claims);

    const pick = (obj: any, keys: string[]) => {
      if (!obj) return null;
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
      }
      return null;
    };

    const claimHtmlBlocks = claims
      .map((claim) => {
        // Detect expense arrays under multiple possible keys (backend varies)
        const knownExpenseArrays = [
          "expenses",
          "expenseRows",
          "expenseDetails",
          "claimExpenses",
          "items",
          "expensesList",
          "details",
        ];
        let expenses: any[] = [];
        for (const k of knownExpenseArrays) {
          if (Array.isArray((claim as any)[k])) {
            expenses = (claim as any)[k];
            break;
          }
        }
        // If no array found, but top-level amount exists, treat claim as single-row expense
        const topAmount = pick(claim, ["amount", "totalAmount", "total", "Amount"]);
        if (!expenses.length && topAmount !== null) expenses = [claim];

        const rows = expenses.length
          ? expenses
              .map((exp: any) => {
                const desc = pick(exp, ["expensesName", "remarks", "description"]) || pick(exp, ["name"]) || "-";
                const from = pick(exp, ["fromPlace", "from", "from_place", "origin"]) || "-";
                const to = pick(exp, ["toPlace", "to", "to_place", "destination"]) || "-";
                const mode = pick(exp, ["modeOfTravel", "mode_of_travel"]) || pick(claim, ["modeOfTravel"]) || "-";
                const type = pick(exp, ["expenseType", "type"]) || pick(claim, ["claimType"]) || "-";
                const km = exp.totalKM ?? exp.actualKm ?? exp.km ?? "-";
                const amount = Number(pick(exp, ["amount", "totalAmount", "value"]) ?? 0).toFixed(2);
                return `
                  <tr>
                    <td style="border:1px solid #ddd; padding:8px">${desc}</td>
                    <td style="border:1px solid #ddd; padding:8px">${from}</td>
                    <td style="border:1px solid #ddd; padding:8px">${to}</td>
                    <td style="border:1px solid #ddd; padding:8px">${mode}</td>
                    <td style="border:1px solid #ddd; padding:8px">${type}</td>
                    <td style="border:1px solid #ddd; padding:8px">${km}</td>
                    <td style="border:1px solid #ddd; padding:8px">₹${amount}</td>
                  </tr>`;
              })
              .join("")
          : `<tr>
               <td style="border:1px solid #ddd; padding:8px">${pick(claim, ["comments", "remarks", "description"]) || "-"}</td>
               <td style="border:1px solid #ddd; padding:8px">${pick(claim, ["fromPlace", "from", "origin"]) || "-"}</td>
               <td style="border:1px solid #ddd; padding:8px">${pick(claim, ["toPlace", "to", "destination"]) || "-"}</td>
               <td style="border:1px solid #ddd; padding:8px">${pick(claim, ["modeOfTravel", "mode_of_travel"]) || "-"}</td>
               <td style="border:1px solid #ddd; padding:8px">${pick(claim, ["expenseType", "type"]) || "-"}</td>
               <td style="border:1px solid #ddd; padding:8px">${pick(claim, ["actualKm", "totalKM"]) || "-"}</td>
               <td style="border:1px solid #ddd; padding:8px">₹${Number(pick(claim, ["amount", "totalAmount", "total"]) ?? 0).toFixed(2)}</td>
             </tr>`;

        const total = Number(pick(claim, ["amount", "totalAmount", "total"]) ?? 0) || (expenses.length ? expenses.reduce((s: number, e: any) => s + Number(pick(e, ["amount", "totalAmount", "value"]) ?? 0), 0) : 0);

        return `
          <div class="claim-page">
            <div class="company">JBS Meditech India Pvt. Ltd.</div>
            <div class="meta">Claim Print Format</div>
            <div style="margin-top:12px">
              <strong>Claim No:</strong> ${pick(claim, ["claimNo"]) || "-"}<br/>
              <strong>Date:</strong> ${pick(claim, ["claimDate"]) ? new Date(pick(claim, ["claimDate"])).toLocaleDateString() : "-"}<br/>
              <strong>User:</strong> ${pick(claim, ["userName"]) || "-"}
            </div>
            <div style="margin-top:12px">
              <table style="width:100%; border-collapse:collapse; margin-top:8px;">
                <thead>
                  <tr>
                    <th style="border:1px solid #ddd; padding:8px; background:#f3f4f6">Description</th>
                    <th style="border:1px solid #ddd; padding:8px; background:#f3f4f6">From</th>
                    <th style="border:1px solid #ddd; padding:8px; background:#f3f4f6">To</th>
                    <th style="border:1px solid #ddd; padding:8px; background:#f3f4f6">Mode</th>
                    <th style="border:1px solid #ddd; padding:8px; background:#f3f4f6">Type</th>
                    <th style="border:1px solid #ddd; padding:8px; background:#f3f4f6">KM</th>
                    <th style="border:1px solid #ddd; padding:8px; background:#f3f4f6">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
            <div style="margin-top:16px; text-align:right; font-weight:bold">Total Amount: ₹${total.toFixed(2)}</div>
          </div>
        `;
      })
      .join('<div style="page-break-after:always; height:2px"></div>');

    const html = `
      <html>
        <head>
          <title>Claims Preview</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 20px; }
            .company { font-size: 18px; font-weight: bold }
            .meta { font-size: 13px; color: #333; margin-bottom: 12px }
            table th, table td { font-size:13px }
            @media print { .no-print { display:none } }
          </style>
        </head>
        <body>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px">
            <div><strong>Claims Preview</strong></div>
            <div><a href="#" class="no-print" onclick="window.print(); return false;" style="background:#2563eb; color:white; padding:8px 12px; border-radius:6px; text-decoration:none">Print</a></div>
          </div>
          <div style="margin-top:12px">
            ${claimHtmlBlocks}
          </div>
          <div style="margin-top:24px; font-size:12px; color:#666">Preview generated on: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      alert("Unable to open preview window (popup blocked). Please allow popups for this site.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  useEffect(() => {
    if (displayedTasks.length === 0) {
      setSelectAll(false);
      return;
    }
    setSelectAll(selectedTaskIds.length === displayedTasks.length && displayedTasks.length > 0);
  }, [selectedTaskIds, displayedTasks]);

  // When filters/search/view change, clear selections to avoid stale selection
  useEffect(() => {
    setSelectedTaskIds([]);
    setSelectAll(false);
  }, [filterStatus, searchInput, viewMode, fromDate, toDate, usernameFilter]);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {viewMode === "list" && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border bg-white">
                  {['All','Pending','Approved','Rejected','In Progress','Completed','Cancelled'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="px-2 py-1 rounded-xl border bg-white" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    value={usernameFilter} 
                    onChange={(e) => setUsernameFilter(e.target.value)} 
                    className="px-2 py-1 rounded border" 
                    style={{ width: '120px' }}
                  />
                  <label style={{ fontSize: 12, color: '#374151' }}>From</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-2 py-1 rounded border" />
                  <label style={{ fontSize: 12, color: '#374151' }}>To</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-2 py-1 rounded border" />
                  <button onClick={() => { setFromDate(''); setToDate(''); setUsernameFilter(''); }} className="px-2 py-1 rounded text-sm border ml-2">Clear</button>
                </div>
              </div>
              <div>
                <button disabled={selectedTaskIds.length === 0} onClick={approveSelected} className="px-4 py-2 rounded-xl text-white" style={{ background: selectedTaskIds.length === 0 ? '#9CA3AF' : '#10B981' }}>Approve Selected</button>
                <button disabled={selectedTaskIds.length === 0} onClick={rejectSelected} className="px-4 py-2 rounded-xl text-white ml-2" style={{ background: selectedTaskIds.length === 0 ? '#9CA3AF' : '#EF4444' }}>Reject Selected</button>
                <button disabled={!hasClaimSelected} onClick={() => openBatchClaimPreview()} className="px-4 py-2 rounded-xl text-white ml-2" style={{ background: !hasClaimSelected ? '#9CA3AF' : '#4F46E5' }}>Print Selected</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Task Manager</h1>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </div>

            <div>
              <button
                onClick={() => setViewMode("card")}
                className="px-3 py-2 rounded-xl border bg-gray-100"
                title="Card view"
              >
                Card
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="px-3 py-2 rounded-xl border bg-gray-100 ml-2"
                title="List view"
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>
        {/* Simple Task Grid / List for testing */}
        {loading ? (
          <div>Loading tasks...</div>
        ) : displayedTasks.length === 0 ? (
          <div>No tasks found</div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">{task.taskName}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                  </div>
                  <div className="ml-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${statusConfig[task.status as keyof typeof statusConfig]?.bg || 'bg-gray-100'} ${statusConfig[task.status as keyof typeof statusConfig]?.text || 'text-gray-700'}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">{getInitials(getAssigneeName(task))}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{getAssigneeName(task)}</div>
                        <div className="text-xs text-gray-500">{task.priority} • {task.stage}</div>
                        {task.comments && (
                          <div className="mt-2 text-xs text-rose-600">Comment: {task.comments}</div>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button disabled={updatingIds.includes(task.id)} onClick={() => updateTaskStatus(task, 'Approved')} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60">Approve</button>
                        <button disabled={updatingIds.includes(task.id)} onClick={() => openRejectModal(task.id)} className="px-3 py-1 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => {
                        setSelectAll(e.target.checked);
                        if (e.target.checked) setSelectedTaskIds(displayedTasks.map((t) => t.id));
                        else setSelectedTaskIds([]);
                      }}
                    />
                  </th>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">UserName</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedTaskIds.includes(t.id)} onChange={() => toggleSelectTask(t.id)} />
                    </td>
                    <td className="px-4 py-3 font-medium">{t.taskName}</td>
                    <td className="px-4 py-3">{getDisplayUserName(t)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded ${statusConfig[t.status as keyof typeof statusConfig]?.bg || 'bg-gray-100'} ${statusConfig[t.status as keyof typeof statusConfig]?.text || 'text-gray-700'} text-sm`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">{getTaskAmount(t)}</td>
                    <td className="px-4 py-3">{getTaskType(t)}</td>
                    <td className="px-4 py-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.status === 'Pending' && (
                          <div className="flex items-center gap-2">
                            <button disabled={updatingIds.includes(t.id)} onClick={() => updateTaskStatus(t, 'Approved')} className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm disabled:opacity-60">Approve</button>
                            <button disabled={updatingIds.includes(t.id)} onClick={() => openRejectModal(t.id)} className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm disabled:opacity-60">Reject</button>
                          </div>
                        )}

                        <button
                          onClick={() => openClaimPreview(t.stageItemId)}
                          disabled={!(t.stage && t.stage.toLowerCase().includes('claim') && t.stageItemId)}
                          className={`px-3 py-1 rounded-lg text-white text-sm ${t.stage && t.stage.toLowerCase().includes('claim') && t.stageItemId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300'}`}
                        >
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Reject comment modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={closeRejectModal} />
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 w-full max-w-lg">
            <h3 className="text-lg font-semibold">Reject Task</h3>
            <p className="text-sm text-gray-600 mt-1">Provide a reason for rejecting this task (visible on the task card).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full mt-4 p-3 border rounded-md h-28"
              placeholder="Enter rejection comments..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeRejectModal} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={submitReject} className="px-4 py-2 rounded-md bg-rose-600 text-white">Reject Task</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskManagement;
