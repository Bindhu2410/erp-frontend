import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaArrowLeft,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { useUser } from "../../../context/UserContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  id?: number;
  grnId?: number;
  item_id?: number;
  item_name?: string;
  unit: string;
  qc_passed: boolean;
  rate: number | null;
  ordered_qty: number | null;
  pending_qty: number | null;
  billed_qty: number | null;
  grn_qty: number | null;
  amount: number;
}

interface GRNFormData {
  id?: number;
  grnNo: string;
  grnDate: string;
  poId: string;
  supplierId: number | "";
  supplierName?: string;
  locationId: number | "";
  refNo: string;
  refDate: string;
  status: string;
  narration: string;
  items: LineItem[];
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
}

interface SelectOption {
  label: string;
  value: string | number;
}

interface ItemOption {
  label: string;
  value: number;
  unit: string;
  rate: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const emptyLine = (): LineItem => ({
  unit: "",
  qc_passed: false,
  rate: null,
  ordered_qty: null,
  pending_qty: null,
  billed_qty: null,
  grn_qty: null,
  amount: 0,
});

const statusOptions = ["Draft", "Submitted", "Approved", "Rejected"];

// ─── Component ───────────────────────────────────────────────────────────────

const GRNFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dropdown options
  const [poOptions, setPoOptions] = useState<SelectOption[]>([]);
  const [poData, setPoData] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);

  const [form, setForm] = useState<GRNFormData>({
    grnNo: "",
    grnDate: new Date().toISOString().split("T")[0],
    poId: "",
    supplierId: "",
    locationId: "",
    refNo: "",
    refDate: "",
    status: "Draft",
    narration: "",
    items: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Fetch Dropdowns ─────────────────────────────────────────────────────

  const fetchDropdowns = useCallback(async () => {
    setLoading(true);
    try {
      const [supplierRes, itemRes, locationRes, unitRes, poRes] =
        await Promise.all([
          api.get("Supplier"),
          api.get("ItemMaster"),
          api.get("ItemLocation"),
          api.get("uom"),
          api.get("PurchaseOrder"),
        ]);

      setPoData(poRes.data);
      setPoOptions(
        (poRes.data as any[]).map((po: any) => ({
          label: po.purchaseOrder?.poId ?? po.poId,
          value: po.purchaseOrder?.poId ?? po.poId,
        }))
      );

      setSupplierOptions(
        (supplierRes.data?.items ?? supplierRes.data ?? []).map((s: any) => ({
          label: s.vendorName ?? s.companyName ?? `Supplier ${s.id}`,
          value: s.id,
        }))
      );

      setItemOptions(
        (itemRes.data?.items ?? itemRes.data ?? []).map((i: any) => ({
          label: i.itemName ?? i.itemDesc ?? i.description ?? `Item ${i.id}`,
          value: i.id,
          unit: i.uom ?? i.unit ?? "Nos.",
          rate: i.rate ?? i.purchasePrice ?? 0,
        }))
      );

      setLocationOptions(
        (locationRes.data?.items ?? locationRes.data ?? []).map((l: any) => ({
          label: l.name ?? l.locationName ?? `Location ${l.id}`,
          value: l.id,
        }))
      );

      setUnitOptions(
        (unitRes.data?.items ?? unitRes.data ?? []).map((u: any) => ({
          label: u.code ?? u.uomDescription ?? u.unit,
          value: u.id ?? u.code ?? u.unit,
        }))
      );
    } catch {
      toast.error("Failed to load form options.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Load existing GRN for edit ──────────────────────────────────────────

  const fetchGRN = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`GoodsReceiptNote/${id}`);
      const data = res.data;
      const grn = data.grn ?? data;
      const itemDetails: any[] = data.itemDetails ?? [];

      setForm({
        id: grn.id,
        grnNo: grn.grnNo ?? "",
        grnDate: grn.grnDate
          ? new Date(grn.grnDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        poId: grn.poId ?? "",
        supplierId: grn.supplierId ?? "",
        locationId: grn.locationId ?? "",
        refNo: grn.refNo ?? "",
        refDate: grn.refDate
          ? new Date(grn.refDate).toISOString().split("T")[0]
          : "",
        status: grn.status ?? "Draft",
        narration: grn.narration ?? "",
        userCreated: grn.userCreated,
        dateCreated: grn.dateCreated,
        items: (grn.items ?? []).map((item: any) => {
          const detail = itemDetails.find((d) => d.id === item.itemId);
          return {
            id: item.id,
            grnId: item.grnId ?? grn.id,
            item_id: item.itemId,
            item_name: detail?.itemName ?? `Item ${item.itemId}`,
            unit: detail?.uomName ?? "Nos.",
            qc_passed: item.qcPassed ?? false,
            rate: detail?.unitPrice ?? 0,
            ordered_qty: item.orderedQty ?? null,
            pending_qty: item.pendingQty ?? null,
            billed_qty: item.billedQty ?? null,
            grn_qty: item.grnQty ?? null,
            amount: item.amount ?? 0,
          };
        }),
      });
    } catch {
      toast.error("Failed to load GRN.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    if (isEdit) fetchGRN();
  }, [isEdit, fetchGRN]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: "" }));

  const handleField = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);

    if (name === "poId") handlePoSelect(value);
  };

  const handlePoSelect = (poId: string) => {
    if (!poId) {
      setForm((prev) => ({
        ...prev,
        poId: "",
        supplierId: "",
        supplierName: "",
        items: [],
      }));
      return;
    }
    const poDetails = poData.find(
      (po: any) => (po.purchaseOrder?.poId ?? po.poId) === poId
    );
    if (!poDetails) return;

    const supplierId =
      poDetails.purchaseOrder?.supplierId ?? poDetails.supplierId;
    const supplierName = poDetails.vendorName ?? "";

    const poItems = (poDetails.items ?? []).map((item: any) => ({
      item_id: item.itemId,
      item_name: item.itemName,
      unit: item.uomName ?? "Nos.",
      qc_passed: false,
      rate: item.unitPrice ?? 0,
      ordered_qty: item.qty ?? 0,
      pending_qty: 0,
      billed_qty: 0,
      grn_qty: null,
      amount: 0,
    }));

    setForm((prev) => ({
      ...prev,
      poId,
      supplierId,
      supplierName,
      items: poItems,
    }));
  };

  const handleAddItem = () =>
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyLine()] }));

  const handleRemoveItem = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  const handleItemField = (
    idx: number,
    field: keyof LineItem,
    value: any
  ) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };

      if (field === "item_id") {
        const opt = itemOptions.find((o) => o.value === Number(value));
        if (opt) {
          items[idx].item_name = opt.label;
          items[idx].unit = opt.unit;
          items[idx].rate = opt.rate;
        }
      }

      // Recalc amount
      const qty = Number(items[idx].grn_qty ?? 0);
      const rate = Number(items[idx].rate ?? 0);
      items[idx].amount = qty * rate;

      clearError(`item_${idx}_id`);
      clearError(`item_${idx}_grn_qty`);
      return { ...prev, items };
    });
  };

  // ─── Validation ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.grnDate) e.grnDate = "Required";
    if (!form.supplierId) e.supplierId = "Required";
    if (form.items.length === 0) e.items = "Add at least one item";
    form.items.forEach((item, idx) => {
      if (!item.item_id) e[`item_${idx}_id`] = "Required";
      if (!item.grn_qty && item.grn_qty !== 0)
        e[`item_${idx}_grn_qty`] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (submitStatus?: string) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        Id: form.id ?? 0,
        UserCreated: isEdit
          ? form.userCreated ?? user?.userId ?? 0
          : user?.userId ?? 0,
        DateCreated: isEdit
          ? form.dateCreated
          : new Date().toISOString(),
        UserUpdated: user?.userId ?? 0,
        DateUpdated: new Date().toISOString(),
        GrnNo: form.grnNo || undefined,
        GrnDate: new Date(form.grnDate).toISOString(),
        PoId: form.poId || null,
        SupplierId: Number(form.supplierId),
        LocationId: form.locationId ? Number(form.locationId) : null,
        RefNo: form.refNo || null,
        RefDate: form.refDate ? new Date(form.refDate).toISOString() : null,
        Narration: form.narration,
        Status: submitStatus ?? form.status,
        Items: form.items.map((item) => ({
          Id: item.id ?? 0,
          GrnId: item.grnId ?? form.id ?? 0,
          ItemId: item.item_id,
          Unit: item.unit,
          QcPassed: item.qc_passed,
          Rate: item.rate ?? 0,
          OrderedQty: item.ordered_qty ?? 0,
          PendingQty: item.pending_qty ?? 0,
          BilledQty: item.billed_qty ?? 0,
          GrnQty: item.grn_qty ?? 0,
          Amount: item.amount,
        })),
      };

      if (isEdit) {
        await api.put(`GoodsReceiptNote/${form.id}`, payload);
        toast.success("GRN updated successfully.");
      } else {
        await api.post("GoodsReceiptNote", payload);
        toast.success("GRN created successfully.");
      }
      navigate("/goods-receipt-note");
    } catch {
      toast.error("Failed to save GRN. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Totals ──────────────────────────────────────────────────────────────

  const grandTotal = form.items.reduce(
    (sum, item) => sum + Number(item.amount ?? 0),
    0
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls = (err?: string) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      err ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  const labelCls = "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/goods-receipt-note")}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaFileAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEdit ? `Edit GRN — ${form.grnNo}` : "New Goods Receipt Note"}
              </h1>
              <p className="text-sm text-gray-500">
                Record goods received against a Purchase Order
              </p>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            form.status === "Approved"
              ? "bg-green-100 text-green-700"
              : form.status === "Submitted"
              ? "bg-blue-100 text-blue-700"
              : form.status === "Rejected"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {form.status}
        </span>
      </div>

      {/* ── Header Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
          GRN Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* GRN No — only shown in edit */}
          {isEdit && (
            <div>
              <label className={labelCls}>GRN No</label>
              <input
                type="text"
                name="grnNo"
                value={form.grnNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500"
              />
            </div>
          )}

          {/* GRN Date */}
          <div>
            <label className={labelCls}>GRN Date *</label>
            <input
              type="date"
              name="grnDate"
              value={form.grnDate}
              onChange={handleField}
              className={inputCls(errors.grnDate)}
            />
            {errors.grnDate && (
              <p className="text-red-500 text-xs mt-1">{errors.grnDate}</p>
            )}
          </div>

          {/* PO Number */}
          <div>
            <label className={labelCls}>Purchase Order</label>
            <select
              name="poId"
              value={form.poId}
              onChange={handleField}
              className={inputCls()}
            >
              <option value="">— Select PO (optional) —</option>
              {poOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {form.poId && (
              <p className="text-xs text-blue-600 mt-1">
                Supplier &amp; items auto-filled from PO
              </p>
            )}
          </div>

          {/* Supplier */}
          <div>
            <label className={labelCls}>Supplier *</label>
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={handleField}
              className={inputCls(errors.supplierId)}
              disabled={!!form.poId}
            >
              <option value="">— Select Supplier —</option>
              {supplierOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.supplierId && (
              <p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>Receive Location</label>
            <select
              name="locationId"
              value={form.locationId}
              onChange={handleField}
              className={inputCls()}
            >
              <option value="">— Select Location —</option>
              {locationOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ref No */}
          <div>
            <label className={labelCls}>Reference No</label>
            <input
              type="text"
              name="refNo"
              value={form.refNo}
              onChange={handleField}
              placeholder="e.g. Delivery note no."
              className={inputCls()}
            />
          </div>

          {/* Ref Date */}
          <div>
            <label className={labelCls}>Reference Date</label>
            <input
              type="date"
              name="refDate"
              value={form.refDate}
              onChange={handleField}
              className={inputCls()}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleField}
              className={inputCls()}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Narration — full width */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelCls}>Narration / Notes</label>
            <textarea
              name="narration"
              value={form.narration}
              onChange={handleField}
              rows={2}
              placeholder="Enter any additional notes..."
              className={inputCls() + " resize-none"}
            />
          </div>
        </div>
      </div>

      {/* ── Items Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            GRN Items
            {form.items.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {form.items.length}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <FaPlus size={12} /> Add Item
          </button>
        </div>

        {errors.items && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">
            {errors.items}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[220px]">
                  Item *
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Unit
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  QC Pass
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                  Rate (₹)
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                  Ordered Qty
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                  Pending Qty
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                  Billed Qty
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                  GRN Qty *
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                  Amount (₹)
                </th>
                <th className="px-3 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <FaFileAlt className="mx-auto text-3xl mb-2 text-gray-200" />
                    <p>No items yet. Click "Add Item" to start.</p>
                    {form.poId && (
                      <p className="text-xs text-blue-500 mt-1">
                        Or select a PO above to auto-load its items.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                form.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    {/* Item */}
                    <td className="px-3 py-2">
                      {item.item_name && isEdit ? (
                        <div className="flex items-center justify-between border border-blue-200 bg-blue-50 rounded-md px-2 py-1.5 text-blue-800 text-sm">
                          <span className="truncate max-w-[160px]" title={item.item_name}>
                            {item.item_name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleItemField(idx, "item_name", undefined)
                            }
                            className="text-blue-400 hover:text-blue-700 ml-2 flex-shrink-0"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ) : (
                        <select
                          value={item.item_id ?? ""}
                          onChange={(e) =>
                            handleItemField(idx, "item_id", Number(e.target.value))
                          }
                          className={`w-full px-2 py-1.5 border rounded-md text-sm ${
                            errors[`item_${idx}_id`]
                              ? "border-red-400"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select item...</option>
                          {itemOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors[`item_${idx}_id`] && (
                        <p className="text-red-500 text-xs mt-0.5">Required</p>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="px-3 py-2">
                      {item.item_id ? (
                        <input
                          type="text"
                          value={item.unit}
                          readOnly
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500"
                        />
                      ) : (
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            handleItemField(idx, "unit", e.target.value)
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">—</option>
                          {unitOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* QC Passed */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.qc_passed}
                        onChange={(e) =>
                          handleItemField(idx, "qc_passed", e.target.checked)
                        }
                        className="w-4 h-4 accent-blue-600"
                      />
                    </td>

                    {/* Rate */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.rate ?? ""}
                        onChange={(e) =>
                          handleItemField(
                            idx,
                            "rate",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-right"
                        min="0"
                        step="0.01"
                      />
                    </td>

                    {/* Ordered Qty */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.ordered_qty ?? ""}
                        readOnly
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm text-right bg-gray-50 text-gray-500"
                      />
                    </td>

                    {/* Pending Qty */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.pending_qty ?? ""}
                        onChange={(e) =>
                          handleItemField(
                            idx,
                            "pending_qty",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-right"
                        min="0"
                      />
                    </td>

                    {/* Billed Qty */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.billed_qty ?? ""}
                        onChange={(e) =>
                          handleItemField(
                            idx,
                            "billed_qty",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-right"
                        min="0"
                      />
                    </td>

                    {/* GRN Qty */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.grn_qty ?? ""}
                        onChange={(e) =>
                          handleItemField(
                            idx,
                            "grn_qty",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className={`w-full px-2 py-1.5 border rounded-md text-sm text-right font-semibold ${
                          errors[`item_${idx}_grn_qty`]
                            ? "border-red-400 bg-red-50"
                            : "border-blue-300 bg-blue-50"
                        }`}
                        min="0"
                        step="0.001"
                        placeholder="0"
                      />
                      {errors[`item_${idx}_grn_qty`] && (
                        <p className="text-red-500 text-xs mt-0.5">Required</p>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm text-right bg-gray-50 font-semibold text-gray-700"
                      />
                    </td>

                    {/* Remove */}
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-400 hover:text-red-600 p-1 rounded transition"
                        title="Remove row"
                      >
                        <FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Grand Total */}
            {form.items.length > 0 && (
              <tfoot>
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td
                    colSpan={8}
                    className="px-3 py-3 text-right text-sm font-bold text-gray-700"
                  >
                    Grand Total
                  </td>
                  <td className="px-3 py-3 text-right text-base font-bold text-blue-700">
                    ₹ {grandTotal.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <button
          type="button"
          onClick={() => navigate("/goods-receipt-note")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <FaTimes size={13} /> Cancel
        </button>

        <div className="flex items-center gap-3">
          {/* Save as Draft */}
          <button
            type="button"
            onClick={() => handleSubmit("Draft")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Save as Draft
          </button>

          {/* Save & Submit */}
          <button
            type="button"
            onClick={() => handleSubmit("Submitted")}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition disabled:opacity-50"
          >
            <FaSave size={13} />
            {saving ? "Saving..." : isEdit ? "Update GRN" : "Submit GRN"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GRNFormPage;
