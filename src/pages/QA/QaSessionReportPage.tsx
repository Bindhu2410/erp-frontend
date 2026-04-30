import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaBell,
  FaPrint,
  FaChevronDown,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { qaSessionService, qaPaymentService } from "../../services/qaService";
import QaStatusBadge from "../../components/qa/QaStatusBadge";
import QaSessionSummaryCards from "../../components/qa/QaSessionSummaryCards";
import QaPaymentFlagPanel from "../../components/qa/QaPaymentFlagPanel";
import type {
  QaSessionDetail,
  QaInspectionItem,
  QaPaymentFlag,
} from "../../types/qa";

// ─── Expandable Report Table Row ──────────────────────────────────────────────
const ReportRow: React.FC<{
  item: QaInspectionItem;
  depth: number;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
}> = ({ item, depth, expandedIds, onToggle }) => {
  const isExpanded = expandedIds.has(item.id);
  const hasChildren = item.subItems && item.subItems.length > 0;

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
        <td className="py-2.5 px-3 text-sm">
          <div className="flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="mr-2 text-gray-400 hover:text-gray-700"
              >
                {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              </button>
            ) : (
              <span className="w-4 mr-2 inline-block" />
            )}
            {depth > 0 && <span className="mr-2 text-gray-300 text-xs">└</span>}
            <span
              className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                item.itemType === "Main"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {item.itemCode || "—"}
            </span>
          </div>
        </td>
        <td className="py-2.5 px-3 text-sm text-gray-800">
          <div className="flex items-center gap-1.5">
            {item.isWrongProduct && (
              <FaExclamationTriangle className="text-purple-500 shrink-0" size={12} />
            )}
            <span className={item.itemType === "Main" ? "font-medium" : ""}>{item.itemName}</span>
          </div>
          {item.isWrongProduct && item.wrongProductItemName && (
            <div className="text-xs text-purple-600 mt-0.5 flex items-center gap-1">
              <span className="font-semibold">Expected:</span> {item.itemName}
              <span className="mx-1 text-gray-400">→</span>
              <span className="font-semibold text-purple-700">Received:</span>{" "}
              {item.wrongProductItemName}
            </div>
          )}
        </td>
        <td className="py-2.5 px-3 text-sm text-center text-gray-600">{item.expectedQty}</td>
        <td className="py-2.5 px-3 text-sm text-center text-gray-700">{item.receivedQty}</td>
        <td className="py-2.5 px-3">
          <QaStatusBadge status={item.status} />
        </td>
        <td className="py-2.5 px-3 text-xs text-gray-500 max-w-[200px] truncate">
          {item.remarks || "—"}
        </td>
        <td className="py-2.5 px-3 text-xs text-gray-500">
          {item.checklistTemplate?.templateName ?? "—"}
        </td>
      </tr>
      {isExpanded &&
        item.subItems.map((child) => (
          <ReportRow
            key={child.id}
            item={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
    </>
  );
};

// ─── Notify Vendor Modal ──────────────────────────────────────────────────────
const NotifyVendorModal: React.FC<{
  onClose: () => void;
  onSend: (type: string, message: string) => void;
  sending?: boolean;
}> = ({ onClose, onSend, sending = false }) => {
  const [type, setType] = useState("All");
  const [message, setMessage] = useState("");

  const TYPES = ["Missing", "Failed", "WrongProduct", "All"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-lg">Notify Vendor</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Notification Type
          </label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                  type === t
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t === "WrongProduct" ? "Wrong Product" : t}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-1">Message</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter the notification message to send to the vendor..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending || !message.trim()}
            onClick={() => onSend(type, message)}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Report Page ─────────────────────────────────────────────────────────
const QaSessionReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<QaSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifySending, setNotifySending] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const flattenItems = (items: QaInspectionItem[]): QaInspectionItem[] =>
    items.flatMap((i) => [i, ...flattenItems(i.subItems ?? [])]);

  const fetchSession = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await qaSessionService.getById(Number(id));
      setSession(data);
      // Auto-expand main items
      setExpandedIds(
        new Set(data.inspectionItems.filter((i) => i.itemType === "Main").map((i) => i.id))
      );
    } catch {
      toast.error("Failed to load QA session.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleToggle = (itemId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleNotifySend = async (type: string, message: string) => {
    if (!session) return;
    try {
      setNotifySending(true);
      const res = await qaSessionService.notifyVendor(session.id, type, message);
      toast.success(`Vendor notified at ${res.vendorEmail}`);
      setShowNotifyModal(false);
    } catch {
      toast.error("Failed to notify vendor.");
    } finally {
      setNotifySending(false);
    }
  };

  const handlePaymentSave = async (flag: QaPaymentFlag) => {
    if (!session) return;
    try {
      setPaymentSaving(true);
      await qaPaymentService.save(session.id, flag);
      toast.success("Payment flag saved.");
      fetchSession();
    } catch {
      toast.error("Failed to save payment flag.");
    } finally {
      setPaymentSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <div className="text-center py-16 text-gray-500">QA Session not found.</div>;
  }

  const allItems = flattenItems(session.inspectionItems);
  const approved = allItems.filter((i) => i.status === "Approved").length;
  const failed = allItems.filter((i) => i.status === "Failed").length;
  const missing = allItems.filter((i) => i.status === "Missing").length;
  const wrongProduct = allItems.filter((i) => i.status === "WrongProduct").length;
  const pending = allItems.filter((i) => i.status === "Pending").length;
  const mainItems = allItems.filter((i) => i.itemType === "Main").length;
  const subItems = allItems.filter((i) => i.itemType === "SubProduct").length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/qa/sessions")}
            className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded transition"
          >
            <FaArrowLeft />
          </button>
          <div className="bg-teal-100 p-2 rounded-lg">
            <FaShieldAlt className="text-teal-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">QA Report</h1>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-sm font-semibold text-teal-700">{session.sessionNo}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">{session.grnNo}</span>
              <QaStatusBadge status={session.overallResult} size="md" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNotifyModal(true)}
            className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            <FaBell size={13} /> Notify Vendor
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            <FaPrint size={13} /> Print
          </button>
          {session.status !== "Completed" && (
            <button
              onClick={() => navigate(`/qa/sessions/${session.id}/inspect`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              Continue Inspection
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <QaSessionSummaryCards
        totalItems={mainItems}
        totalSubItems={subItems}
        approved={approved}
        failed={failed}
        missing={missing}
        wrongProduct={wrongProduct}
        pending={pending}
      />

      {/* Supplier + Invoice Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Supplier Information
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">Vendor Name</dt>
              <dd className="font-medium text-gray-800">{session.supplier?.vendorName ?? "—"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">Vendor Code</dt>
              <dd className="text-gray-700">{session.supplier?.vendorCode ?? "—"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">GST No</dt>
              <dd className="text-gray-700">{session.supplier?.gstNumber ?? "—"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">Email</dt>
              <dd className="text-gray-700">{session.supplier?.email?.join(", ") ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Invoice & GRN Details
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">GRN No</dt>
              <dd className="font-medium text-teal-700">{session.grnNo}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">GRN Date</dt>
              <dd className="text-gray-700">
                {session.grnDate
                  ? new Date(session.grnDate).toLocaleDateString("en-IN")
                  : "—"}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">Invoice No</dt>
              <dd className="font-medium text-gray-800">{session.invoiceNo || "—"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">Invoice Amount</dt>
              <dd className="font-semibold text-gray-800">
                {session.invoiceAmount != null
                  ? `₹ ${session.invoiceAmount.toLocaleString("en-IN")}`
                  : "—"}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-500 w-32 shrink-0">Inspector</dt>
              <dd className="text-gray-700">{session.inspectorName ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Inspection Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Inspection Results
          </h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              {["Item Code", "Item Name", "Expected Qty", "Received Qty", "Status", "Remarks", "Template"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {session.inspectionItems.map((item) => (
              <ReportRow
                key={item.id}
                item={item}
                depth={0}
                expandedIds={expandedIds}
                onToggle={handleToggle}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Flag */}
      <div className="mb-6">
        <QaPaymentFlagPanel
          invoiceAmount={session.invoiceAmount ?? 0}
          paymentFlag={session.paymentFlag}
          onSave={handlePaymentSave}
          saving={paymentSaving}
        />
      </div>

      {/* Notify Vendor Modal */}
      {showNotifyModal && (
        <NotifyVendorModal
          onClose={() => setShowNotifyModal(false)}
          onSend={handleNotifySend}
          sending={notifySending}
        />
      )}
    </div>
  );
};

export default QaSessionReportPage;
