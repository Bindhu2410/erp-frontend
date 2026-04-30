import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit3,
  FiPrinter,
  FiDownload,
  FiClock,
} from "react-icons/fi";
import Cards from "../../components/common/Cards";
import api from "../../services/api";
import {
  Target,
  TargetDetail,
  TargetStatus,
} from "../../types/target";

interface TargetWithDetails extends Target {
  details: TargetDetail[];
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(typeof value === "string" ? Number(value) || 0 : value);

const statusClasses: Record<TargetStatus, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Approved: "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  Completed: "bg-purple-100 text-purple-800",
  Cancelled: "bg-red-100 text-red-800",
};

const TargetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [target, setTarget] = useState<TargetWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = location.pathname.endsWith("/edit");

  useEffect(() => {
    const fetchTarget = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`Target/${id}`);
        const payload = response?.data;

        if (payload) {
          const normalized = normalizeTargetPayload(id, payload);
          setTarget(normalized);
          return;
        }
      } catch (err) {
        console.warn("Target API unavailable, falling back to mock data");
      } finally {
        setLoading(false);
      }

      // Fallback to mock
      setTarget(buildMockTarget(id));
      setLoading(false);
    };

    fetchTarget();
  }, [id]);

  const summaryCards = useMemo(() => {
    if (!target) return [];
    const totalTarget = target.details.reduce(
      (acc, d) => acc + (d.targetAmount || 0),
      0,
    );
    const achieved = target.details.reduce(
      (acc, d) => acc + (d.achievedAmount || 0),
      0,
    );
    const achievementPct = totalTarget
      ? (achieved / totalTarget) * 100
      : 0;
    const remaining = totalTarget - achieved;

    return [
      {
        title: "Total Target",
        value: formatCurrency(totalTarget),
        description: "Amount planned for this period",
        icon: "FaBullseye",
        color: 0,
      },
      {
        title: "Achieved",
        value: formatCurrency(achieved),
        description: "Revenue booked so far",
        icon: "FaChartLine",
        color: 1,
      },
      {
        title: "Achievement %",
        value: `${achievementPct.toFixed(1)}%`,
        description: "Progress vs target",
        icon: "FaPercentage",
        color: 2,
      },
      {
        title: "Remaining",
        value: formatCurrency(Math.max(remaining, 0)),
        description: "Left to close the target",
        icon: "FaHourglassHalf",
        color: 3,
      },
    ];
  }, [target]);

  const achievementBarWidth = useMemo(() => {
    if (!target) return 0;
    const totalTarget = target.details.reduce(
      (acc, d) => acc + (d.targetAmount || 0),
      0,
    );
    const achieved = target.details.reduce(
      (acc, d) => acc + (d.achievedAmount || 0),
      0,
    );
    return totalTarget ? Math.min((achieved / totalTarget) * 100, 100) : 0;
  }, [target]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading target...</div>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">
          {error || "Target not found or still being prepared"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100"
            title="Back"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs uppercase text-gray-500">Target</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {target.docId}
            </h1>
            <p className="text-gray-500 text-sm">
              {formatDateRange(target.fromDate, target.toDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 flex items-center gap-2"
          >
            <FiPrinter /> Print
          </button>
          <button
            onClick={() =>
              navigate(`/sales/targets/${target.id || id}/edit`)
            }
            className="px-3 py-2 rounded-md border border-orange-500 text-orange-600 hover:bg-orange-50 flex items-center gap-2"
          >
            <FiEdit3 /> {isEditMode ? "Editing" : "Edit"}
          </button>
          <button
            onClick={() => downloadCsv(target)}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 flex items-center gap-2"
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, idx) => (
          <Cards key={card.title} {...card} color={idx} />
        ))}
      </div>

      {/* General info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              General Information
            </h2>
            <p className="text-gray-500 text-sm">
              Territory & owner details
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[target.status]}`}
          >
            {target.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4">
          <InfoRow label="Territory" value={target.territory} />
          <InfoRow label="Zone" value={target.zoneName || "—"} />
          <InfoRow label="Sales Rep" value={target.employeeName} />
          <InfoRow label="Period" value={formatDateRange(target.fromDate, target.toDate)} />
          <InfoRow label="Created" value={formatAsDate(target.createdDate)} />
          <InfoRow label="Document ID" value={target.docId} />
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FiClock /> Achievement Progress
          </p>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
              style={{ width: `${achievementBarWidth.toFixed(1)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{achievementBarWidth.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Detail lines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Product / Model Breakdown
          </h2>
          <span className="text-sm text-gray-500">
            {target.details.length} line items
          </span>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {target.details.length === 0 ? (
            <div className="text-center text-gray-500 py-6">No line items captured yet.</div>
          ) : (
            target.details.map((d, idx) => {
              const pct = d.targetAmount ? (d.achievedAmount / d.targetAmount) * 100 : 0;
              return (
                <div key={d.id || idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Product & Model</p>
                      <p className="text-sm font-bold text-gray-900">{d.productName}</p>
                      <p className="text-xs text-gray-600">{d.modelName || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Qty</p>
                      <p className="text-sm font-semibold">{d.qty}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-gray-200 pt-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Target</p>
                      <p className="text-sm font-medium">{formatCurrency(d.targetAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Achieved</p>
                      <p className="text-sm font-medium">{formatCurrency(d.achievedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Achv. %</p>
                      <p className={`text-sm font-bold ${pct >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {pct.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Product</Th>
                <Th>Model</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Target Amount</Th>
                <Th className="text-right">Achieved</Th>
                <Th className="text-right">Achv. %</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {target.details.map((d, idx) => {
                const pct = d.targetAmount
                  ? (d.achievedAmount / d.targetAmount) * 100
                  : 0;
                return (
                  <tr key={d.id || idx} className="hover:bg-gray-50">
                    <Td>{d.productName}</Td>
                    <Td>{d.modelName || "—"}</Td>
                    <Td className="text-right">{d.qty}</Td>
                    <Td className="text-right">
                      {formatCurrency(d.targetAmount)}
                    </Td>
                    <Td className="text-right">
                      {formatCurrency(d.achievedAmount)}
                    </Td>
                    <Td className="text-right">{pct.toFixed(1)}%</Td>
                  </tr>
                );
              })}
              {target.details.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-6"
                  >
                    No line items captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs uppercase text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-800 mt-1">
      {value || "—"}
    </p>
  </div>
);

const Th: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <th
    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const Td: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <td className={`px-4 py-3 text-sm text-gray-800 ${className}`}>
    {children}
  </td>
);

const formatDateRange = (from?: string, to?: string) => {
  const format = (value?: string) =>
    value
      ? new Date(value).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  if (!from && !to) return "—";
  return `${format(from)} — ${format(to)}`;
};

const formatAsDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

const normalizeTargetPayload = (id: string, payload: any): TargetWithDetails => {
  // Supports two shapes: { target, details } or already flattened
  if (payload.target) {
    const master: Target = {
      id: payload.target.id ?? id,
      docId: payload.target.docId ?? payload.target.documentId ?? `TD-${id}`,
      fromDate: payload.target.fromDate ?? payload.target.startDate,
      toDate: payload.target.toDate ?? payload.target.endDate,
      territory: payload.target.territory ?? payload.target.territoryName ?? "",
      territoryId: payload.target.territoryId ?? "",
      zoneId: payload.target.zoneId,
      zoneName: payload.target.zoneName,
      employeeId: payload.target.employeeId ?? "",
      employeeName:
        payload.target.employeeName ?? payload.target.salesRepName ?? "",
      status: (payload.target.status ??
        "Draft") as TargetStatus,
      createdDate: payload.target.createdDate ?? payload.target.dateCreated,
    };

    const details: TargetDetail[] = Array.isArray(payload.details)
      ? payload.details.map((d: any, idx: number) => ({
          id: d.id ?? `${master.id}-${idx}`,
          targetId: master.id,
          productId: d.productId,
          productName: d.productName ?? d.itemName ?? "N/A",
          modelName: d.modelName ?? d.model ?? "N/A",
          qty: Number(d.qty ?? d.quantity ?? 0),
          targetAmount: Number(d.targetAmount ?? d.amount ?? 0),
          achievedAmount: Number(d.achievedAmount ?? d.achieved ?? 0),
          achievementPercentage: d.targetAmount
            ? (Number(d.achievedAmount ?? 0) /
                Number(d.targetAmount ?? 1)) *
              100
            : 0,
        }))
      : [];

    return { ...master, details };
  }

  // If payload is already a master object
  const master: Target = {
    id: payload.id ?? id,
    docId: payload.docId ?? payload.documentId ?? `TD-${id}`,
    fromDate: payload.fromDate ?? payload.startDate,
    toDate: payload.toDate ?? payload.endDate,
    territory: payload.territory ?? payload.territoryName ?? "",
    territoryId: payload.territoryId ?? "",
    zoneId: payload.zoneId,
    zoneName: payload.zoneName,
    employeeId: payload.employeeId ?? "",
    employeeName: payload.employeeName ?? payload.salesRepName ?? "",
    status: (payload.status ?? "Draft") as TargetStatus,
    createdDate: payload.createdDate ?? payload.dateCreated,
  };

  return { ...master, details: payload.details ?? [] };
};

const buildMockTarget = (id: string): TargetWithDetails => ({
  id,
  docId: `TD-${String(id).padStart(5, "0")}`,
  fromDate: "2025-04-01",
  toDate: "2026-03-31",
  territory: "Chennai, Tiruvallur, Kanchipur",
  territoryId: "t1",
  zoneId: "z1",
  zoneName: "Chennai",
  employeeId: "e1",
  employeeName: "Pradeep J",
  status: "Active",
  createdDate: "2025-04-01",
  details: [
    {
      id: `${id}-1`,
      targetId: id,
      productId: "p1",
      productName: "Diathermy",
      modelName: "E-Lite",
      qty: 5,
      targetAmount: 5000000,
      achievedAmount: 1200000,
    },
    {
      id: `${id}-2`,
      targetId: id,
      productId: "p2",
      productName: "TOUCH 5",
      modelName: "COMBI",
      qty: 3,
      targetAmount: 3000000,
      achievedAmount: 750000,
    },
  ],
});

const downloadCsv = (target: TargetWithDetails) => {
  const headers = [
    "Product",
    "Model",
    "Qty",
    "Target Amount",
    "Achieved Amount",
    "Achievement %",
  ];
  const rows = target.details.map((d) => [
    d.productName,
    d.modelName,
    d.qty,
    d.targetAmount,
    d.achievedAmount,
    d.targetAmount
      ? ((d.achievedAmount / d.targetAmount) * 100).toFixed(1)
      : "0",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${target.docId}_details.csv`;
  a.click();
};

export default TargetDetails;
