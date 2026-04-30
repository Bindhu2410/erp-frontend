import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";
import { qaSessionService } from "../../services/qaService";
import type { QaSessionCreateRequest } from "../../types/qa";

interface GrnOption {
  id: number;
  grnNo: string;
  supplierId: number;
  supplierName?: string;
  grnDate: string;
  poId?: string;
}

interface SupplierOption {
  id: number;
  vendorName: string;
}

interface UserOption {
  id: number;
  fullName: string;
  userName?: string;
}

const QaSessionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [grnOptions, setGrnOptions] = useState<GrnOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<QaSessionCreateRequest>({
    grnId: 0,
    invoiceNo: "",
    invoiceDate: "",
    invoiceAmount: undefined,
    sessionDate: new Date().toISOString().split("T")[0],
    inspectorId: 0,
    remarks: "",
  });

  const [selectedGrn, setSelectedGrn] = useState<GrnOption | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [grnRes, supplierRes, userRes] = await Promise.all([
          api.get("GoodsReceiptNote"),
          api.get("Supplier"),
          api.get("User"),
        ]);

        const grnData: any[] = grnRes.data?.items ?? grnRes.data ?? [];
        const supplierList: SupplierOption[] = (
          supplierRes.data?.items ?? supplierRes.data ?? []
        ).map((s: any) => ({
          id: s.id,
          vendorName: s.vendorName ?? s.companyName ?? `Supplier ${s.id}`,
        }));

        const supplierMap: Record<number, string> = {};
        supplierList.forEach((s) => {
          supplierMap[s.id] = s.vendorName;
        });

        const grns: GrnOption[] = grnData.map((g: any) => {
          const grn = g.grn ?? g;
          return {
            id: grn.id,
            grnNo: grn.grnNo,
            supplierId: grn.supplierId,
            supplierName: supplierMap[grn.supplierId],
            grnDate: grn.grnDate,
            poId: grn.poId,
          };
        });

        const userData: UserOption[] = (userRes.data?.items ?? userRes.data ?? []).map(
          (u: any) => ({
            id: u.id,
            fullName: u.fullName ?? u.userName ?? `User ${u.id}`,
            userName: u.userName,
          })
        );

        setGrnOptions(grns);
        setUsers(userData);
      } catch {
        toast.error("Failed to load form data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGrnChange = (grnId: number) => {
    const grn = grnOptions.find((g) => g.id === grnId) ?? null;
    setSelectedGrn(grn);
    setForm((prev) => ({ ...prev, grnId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grnId) {
      toast.error("Please select a GRN.");
      return;
    }
    if (!form.invoiceNo.trim()) {
      toast.error("Invoice number is required.");
      return;
    }
    if (!form.inspectorId) {
      toast.error("Please select an inspector.");
      return;
    }
    try {
      setSubmitting(true);
      const session = await qaSessionService.create(form);
      toast.success(`QA Session ${session.sessionNo} created successfully.`);
      navigate(`/qa/sessions/${session.id}/inspect`);
    } catch {
      toast.error("Failed to create QA session.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/qa/sessions")}
          className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded transition"
        >
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <FaShieldAlt className="text-teal-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">New QA Session</h1>
            <p className="text-sm text-gray-500">
              Start a quality inspection from a GRN
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Section: GRN Selection */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
            GRN Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Select GRN <span className="text-red-500">*</span>
              </label>
              <select
                value={form.grnId || ""}
                onChange={(e) => handleGrnChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">-- Select GRN --</option>
                {grnOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.grnNo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Supplier</label>
              <input
                type="text"
                readOnly
                value={selectedGrn?.supplierName ?? ""}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600"
                placeholder="Auto-filled from GRN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">GRN Date</label>
              <input
                type="text"
                readOnly
                value={
                  selectedGrn?.grnDate
                    ? new Date(selectedGrn.grnDate).toLocaleDateString("en-IN")
                    : ""
                }
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600"
                placeholder="Auto-filled from GRN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">PO Reference</label>
              <input
                type="text"
                readOnly
                value={selectedGrn?.poId ?? ""}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600"
                placeholder="Auto-filled from GRN"
              />
            </div>
          </div>
        </div>

        {/* Section: Invoice Details */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Invoice No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.invoiceNo}
                onChange={(e) => setForm((p) => ({ ...p, invoiceNo: e.target.value }))}
                placeholder="e.g. INV-2026-001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Invoice Date</label>
              <input
                type="date"
                value={form.invoiceDate ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, invoiceDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Invoice Amount (₹)</label>
              <input
                type="number"
                min={0}
                value={form.invoiceAmount ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, invoiceAmount: Number(e.target.value) || undefined }))
                }
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section: Session Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
            Session Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Session Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.sessionDate}
                onChange={(e) => setForm((p) => ({ ...p, sessionDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Inspector <span className="text-red-500">*</span>
              </label>
              <select
                value={form.inspectorId || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, inspectorId: Number(e.target.value) }))
                }
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Select Inspector --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Remarks</label>
              <textarea
                rows={2}
                value={form.remarks ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                placeholder="Any initial remarks..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800">
          <strong>Note:</strong> On creation, the system will automatically expand BOM sub-products
          for each item and load the corresponding QA checklist templates.
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/qa/sessions")}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition"
          >
            {submitting ? "Creating..." : "Create & Start Inspection"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QaSessionCreatePage;
