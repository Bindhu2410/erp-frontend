import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaClipboardCheck,
  FaTrash,
  FaShieldAlt,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { qaSessionService } from "../../services/qaService";
import type { QaSessionListItem } from "../../types/qa";

// Derive the workflow step label + styling from a session
function getWorkflowStep(s: QaSessionListItem): {
  label: string;
  icon: React.ReactNode;
  color: string;
  action: string;
} {
  if (s.status === "Pending") {
    return {
      label: "Awaiting Inspection",
      icon: <FaHourglassHalf className="text-yellow-500" />,
      color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      action: "Start Inspection",
    };
  }
  if (s.status === "In-Progress") {
    return {
      label: "In Inspection",
      icon: <FaSpinner className="text-blue-500 animate-spin" />,
      color: "bg-blue-50 text-blue-700 border border-blue-200",
      action: "Continue Inspection",
    };
  }
  if (s.status === "Completed") {
    if (s.overallResult === "Approved") {
      return {
        label: "QA Approved",
        icon: <FaCheckCircle className="text-green-500" />,
        color: "bg-green-50 text-green-700 border border-green-200",
        action: "View Report",
      };
    }
    if (s.overallResult === "Partial") {
      return {
        label: "Notify Vendor",
        icon: <FaBell className="text-orange-500" />,
        color: "bg-orange-50 text-orange-700 border border-orange-200",
        action: "View Report",
      };
    }
    if (s.overallResult === "Failed") {
      return {
        label: "Full Hold",
        icon: <FaTimesCircle className="text-red-500" />,
        color: "bg-red-50 text-red-700 border border-red-200",
        action: "View Report",
      };
    }
    return {
      label: "Completed",
      icon: <FaCheckCircle className="text-teal-500" />,
      color: "bg-teal-50 text-teal-700 border border-teal-200",
      action: "View Report",
    };
  }
  return {
    label: s.status,
    icon: <FaShieldAlt className="text-gray-400" />,
    color: "bg-gray-50 text-gray-600 border border-gray-200",
    action: "View",
  };
}

const QaSessionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState<QaSessionListItem[]>([]);
  const [filtered, setFiltered] = useState<QaSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Read status & result filters from URL
  const urlStatus = searchParams.get("status") || "";
  const urlResult = searchParams.get("result") || "";

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await qaSessionService.getAll();
      setSessions(data);
    } catch {
      toast.error("Failed to load QA sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    let result = sessions;
    if (urlStatus) {
      result = result.filter(
        (s) => s.status.toLowerCase() === urlStatus.toLowerCase()
      );
    }
    if (urlResult) {
      result = result.filter(
        (s) =>
          s.overallResult?.toLowerCase() === urlResult.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.sessionNo?.toLowerCase().includes(q) ||
          s.grnNo?.toLowerCase().includes(q) ||
          s.supplierName?.toLowerCase().includes(q) ||
          s.invoiceNo?.toLowerCase().includes(q) ||
          s.inspectorName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, urlStatus, urlResult, sessions]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this QA session?")) return;
    try {
      await qaSessionService.delete(id);
      toast.success("QA session deleted.");
      fetchSessions();
    } catch {
      toast.error("Failed to delete QA session.");
    }
  };

  const handlePrimaryAction = (s: QaSessionListItem) => {
    const step = getWorkflowStep(s);
    if (step.action === "Start Inspection" || step.action === "Continue Inspection") {
      navigate(`/qa/sessions/${s.id}/inspect`);
    } else {
      navigate(`/qa/sessions/${s.id}/report`);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN");
  };

  const tabCounts = {
    All: sessions.length,
    Pending: sessions.filter((s) => s.status === "Pending").length,
    "In-Progress": sessions.filter((s) => s.status === "In-Progress").length,
    Completed: sessions.filter((s) => s.status === "Completed").length,
  };

  const pageTitle = urlStatus
    ? urlStatus === "Pending"
      ? "Awaiting Inspection"
      : urlStatus === "In-Progress"
      ? "In Inspection"
      : urlResult === "FullApproved"
      ? "Approved Sessions"
      : urlResult === "PartialHold"
      ? "Vendor to Notify"
      : urlResult === "FullHold"
      ? "Full Hold Sessions"
      : "Completed Sessions"
    : "All QA Sessions";

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <FaShieldAlt className="text-teal-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{pageTitle}</h1>
            <p className="text-sm text-gray-500">Quality Assurance — GRN Inspections</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/qa/sessions/new")}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition"
        >
          <FaPlus /> New QA Session
        </button>
      </div>

      {/* Workflow stage summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(
          [
            { label: "All", count: tabCounts.All, href: "/qa/sessions", color: "bg-gray-100 text-gray-700" },
            { label: "Awaiting", count: tabCounts.Pending, href: "/qa/sessions?status=Pending", color: "bg-yellow-100 text-yellow-700" },
            { label: "In Inspection", count: tabCounts["In-Progress"], href: "/qa/sessions?status=In-Progress", color: "bg-blue-100 text-blue-700" },
            { label: "Completed", count: tabCounts.Completed, href: "/qa/sessions?status=Completed", color: "bg-teal-100 text-teal-700" },
          ] as const
        ).map((t) => (
          <a
            key={t.label}
            href={t.href}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition hover:opacity-80 ${t.color}`}
          >
            {t.label}
            <span className="bg-white bg-opacity-60 rounded-full px-1.5 py-0.5 text-[11px] font-bold">
              {t.count}
            </span>
          </a>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search by session no, GRN, supplier, invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
          <FaShieldAlt className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No QA sessions found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search
              ? "Try adjusting your search"
              : "Create a new QA session from a GRN to get started"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Session No",
                  "GRN No",
                  "Supplier",
                  "Invoice No",
                  "Date",
                  "Inspector",
                  "Items",
                  "Workflow Step",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map((s) => {
                const step = getWorkflowStep(s);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-teal-700">{s.sessionNo}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {s.grnNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[160px] truncate">
                      {s.supplierName || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {s.invoiceNo || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(s.sessionDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {s.inspectorName || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2 text-xs">
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          ✓ {s.approvedItems}
                        </span>
                        <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          ✗ {s.failedItems}
                        </span>
                        {s.wrongProductItems > 0 && (
                          <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            ⚠ {s.wrongProductItems}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Workflow Step — primary action */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handlePrimaryAction(s)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80 ${step.color}`}
                        title={step.action}
                      >
                        {step.icon}
                        {step.label}
                      </button>
                    </td>

                    {/* Secondary actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {(s.status === "Pending" || s.status === "In-Progress") && (
                          <button
                            title="Go to Inspection"
                            onClick={() => navigate(`/qa/sessions/${s.id}/inspect`)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition"
                          >
                            <FaClipboardCheck />
                          </button>
                        )}
                        <button
                          title="View Report"
                          onClick={() => navigate(`/qa/sessions/${s.id}/report`)}
                          className="text-teal-600 hover:text-teal-800 p-1.5 hover:bg-teal-50 rounded transition"
                        >
                          <FaEye />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(s.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QaSessionListPage;
