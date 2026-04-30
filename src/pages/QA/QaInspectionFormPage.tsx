import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronRight,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";
import { qaSessionService, qaInspectionService, qaTemplateService } from "../../services/qaService";
import QaStatusBadge from "../../components/qa/QaStatusBadge";
import QaChecklistForm from "../../components/qa/QaChecklistForm";
import type {
  QaSessionDetail,
  QaInspectionItem,
  QaChecklistItem,
  QaChecklistResponse,
  QaItemStatus,
} from "../../types/qa";

interface ItemMasterOption {
  id: number;
  itemCode: string;
  itemName: string;
}

// ─── Inspection Item Row ──────────────────────────────────────────────────────
const ItemRow: React.FC<{
  item: QaInspectionItem;
  depth: number;
  selectedId: number | null;
  expandedIds: Set<number>;
  onSelect: (item: QaInspectionItem) => void;
  onToggle: (id: number) => void;
}> = ({ item, depth, selectedId, expandedIds, onSelect, onToggle }) => {
  const isSelected = selectedId === item.id;
  const isExpanded = expandedIds.has(item.id);
  const hasChildren = item.subItems && item.subItems.length > 0;

  const rowBg = isSelected
    ? "bg-teal-50 border-l-4 border-teal-500"
    : item.status === "Approved"
    ? "hover:bg-green-50"
    : item.status === "Failed"
    ? "hover:bg-red-50"
    : item.status === "WrongProduct"
    ? "hover:bg-purple-50"
    : item.status === "Missing"
    ? "hover:bg-orange-50"
    : "hover:bg-gray-50";

  return (
    <>
      <tr
        className={`cursor-pointer transition ${rowBg}`}
        onClick={() => onSelect(item)}
      >
        <td className="py-2.5 pl-3 pr-2 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(item.id);
                }}
                className="mr-1.5 text-gray-400 hover:text-gray-700"
              >
                {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              </button>
            ) : (
              <span className="w-4 mr-1.5 inline-block" />
            )}
            {depth > 0 && (
              <span className="mr-1.5 text-gray-300 text-xs">└</span>
            )}
            <span
              className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                item.itemType === "Main" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
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
            <div className="text-xs text-purple-600 mt-0.5">
              ↳ Received: {item.wrongProductItemName}
            </div>
          )}
        </td>
        <td className="py-2.5 px-3 text-xs text-gray-500 text-center">{item.expectedQty}</td>
        <td className="py-2.5 px-3 text-xs text-gray-700 text-center">{item.receivedQty}</td>
        <td className="py-2.5 px-3">
          <QaStatusBadge status={item.status} />
        </td>
      </tr>
      {isExpanded &&
        item.subItems.map((child) => (
          <ItemRow
            key={child.id}
            item={child}
            depth={depth + 1}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const QaInspectionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<QaSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<QaInspectionItem | null>(null);
  const [checklistItems, setChecklistItems] = useState<QaChecklistItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [itemMasterOptions, setItemMasterOptions] = useState<ItemMasterOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Flatten all items from hierarchy for lookup
  const flattenItems = (items: QaInspectionItem[]): QaInspectionItem[] => {
    return items.flatMap((item) => [item, ...flattenItems(item.subItems ?? [])]);
  };

  const fetchSession = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await qaSessionService.getById(Number(id));
      setSession(data);
      // Auto-expand main product rows
      const mainIds = new Set(
        data.inspectionItems.filter((i) => i.itemType === "Main").map((i) => i.id)
      );
      setExpandedIds(mainIds);
      // Select first item by default
      if (data.inspectionItems.length > 0) {
        const first = data.inspectionItems[0];
        handleSelectItem(first, data);
      }
    } catch {
      toast.error("Failed to load QA session.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
    // Load item master for wrong-product lookup
    api.get("itemmaster").then((res) => {
      const data: any[] = res.data?.items ?? res.data ?? [];
      setItemMasterOptions(
        data.map((i: any) => ({
          id: i.id,
          itemCode: i.itemCode ?? i.item_code ?? "",
          itemName: i.itemName ?? i.item_name ?? `Item ${i.id}`,
        }))
      );
    });
  }, [fetchSession]);

  const handleSelectItem = async (
    item: QaInspectionItem,
    sessionData?: QaSessionDetail
  ) => {
    setSelectedItem(item);
    setChecklistItems([]);
    const templateId = item.checklistTemplate?.templateId;
    if (templateId) {
      try {
        const items = await qaTemplateService.getChecklistItems(templateId);
        setChecklistItems(items);
      } catch {
        setChecklistItems([]);
      }
    }
  };

  const handleToggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateItemInTree = (
    items: QaInspectionItem[],
    targetId: number,
    updater: (item: QaInspectionItem) => QaInspectionItem
  ): QaInspectionItem[] => {
    return items.map((item) => {
      if (item.id === targetId) return updater(item);
      return { ...item, subItems: updateItemInTree(item.subItems, targetId, updater) };
    });
  };

  const handleSaveItem = async (
    itemId: number,
    receivedQty: number,
    responses: QaChecklistResponse[],
    isWrongProduct: boolean,
    wrongProductItemId: number | null,
    status: QaItemStatus,
    remarks: string
  ) => {
    try {
      setSaving(true);
      await qaInspectionService.update(itemId, {
        receivedQty,
        isWrongProduct,
        wrongProductItemId,
        status,
        remarks,
      });
      if (responses.length > 0) {
        await qaInspectionService.submitChecklist(itemId, {
          responses: responses.map((r) => ({
            checklistItemId: r.checklistItemId,
            response: r.response as "Pass" | "Fail" | "NA",
            remarks: r.remarks,
          })),
        });
      }

      const wrongProductItem = wrongProductItemId
        ? itemMasterOptions.find((i) => i.id === wrongProductItemId)
        : null;

      // Update local state
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          inspectionItems: updateItemInTree(prev.inspectionItems, itemId, (item) => ({
            ...item,
            receivedQty,
            isWrongProduct,
            wrongProductItemId,
            wrongProductItemName: wrongProductItem?.itemName ?? item.wrongProductItemName,
            status,
            remarks,
            checklistResponses: responses,
          })),
        };
      });

      // Update selected item too
      setSelectedItem((prev) =>
        prev?.id === itemId
          ? {
              ...prev,
              receivedQty,
              isWrongProduct,
              wrongProductItemId,
              wrongProductItemName: wrongProductItem?.itemName ?? prev.wrongProductItemName,
              status,
              remarks,
              checklistResponses: responses,
            }
          : prev
      );

      toast.success("Item result saved.");
    } catch {
      toast.error("Failed to save item result.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    const allItems = flattenItems(session.inspectionItems);
    const hasPending = allItems.some((i) => i.status === "Pending");
    if (hasPending) {
      toast.warning("Some items are still Pending. Please complete all inspections.");
      return;
    }

    const hasAnyFail =
      allItems.some((i) => i.status === "Failed") ||
      allItems.some((i) => i.status === "WrongProduct") ||
      allItems.some((i) => i.status === "Missing");
    const allApproved = allItems.every((i) => i.status === "Approved");
    const overallResult = allApproved ? "Approved" : hasAnyFail ? "Partial" : "Approved";

    try {
      setCompleting(true);
      await qaSessionService.updateStatus(session.id, "Completed", overallResult);
      toast.success("QA Session completed!");
      navigate(`/qa/sessions/${session.id}/report`);
    } catch {
      toast.error("Failed to complete session.");
    } finally {
      setCompleting(false);
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
    return (
      <div className="text-center py-16 text-gray-500">QA Session not found.</div>
    );
  }

  const allItems = flattenItems(session.inspectionItems);
  const approvedCount = allItems.filter((i) => i.status === "Approved").length;
  const pendingCount = allItems.filter((i) => i.status === "Pending").length;
  const failedCount = allItems.filter((i) => i.status === "Failed" || i.status === "WrongProduct" || i.status === "Missing").length;

  return (
    <div className="flex flex-col h-full">
      {/* Session Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/qa/sessions")}
            className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded transition"
          >
            <FaArrowLeft />
          </button>
          <FaShieldAlt className="text-teal-600 text-lg" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-800 text-sm">{session.sessionNo}</span>
              <span className="text-gray-400 text-xs">|</span>
              <span className="text-xs text-gray-600">GRN: {session.grnNo}</span>
              <span className="text-gray-400 text-xs">|</span>
              <span className="text-xs text-gray-600">{session.supplier?.vendorName}</span>
              <span className="text-gray-400 text-xs">|</span>
              <span className="text-xs text-gray-600">Invoice: {session.invoiceNo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress indicators */}
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <FaCheckCircle size={10} /> {approvedCount} Approved
            </span>
            <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
              <FaTimesCircle size={10} /> {failedCount} Issues
            </span>
            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              {pendingCount} Pending
            </span>
          </div>
          <QaStatusBadge status={session.status} size="md" />
          <button
            onClick={handleCompleteSession}
            disabled={completing || session.status === "Completed"}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition"
          >
            {completing ? "Completing..." : "Complete Session"}
          </button>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: Item Tree */}
        <div className="w-[400px] shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Products & Sub-Products
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {allItems.length} items total — click to inspect
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-2 pl-3 pr-2 text-xs font-medium text-gray-400 uppercase w-[120px]">
                  Code
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase">
                  Item
                </th>
                <th className="text-center py-2 px-1 text-xs font-medium text-gray-400 w-10">Exp</th>
                <th className="text-center py-2 px-1 text-xs font-medium text-gray-400 w-10">Rcv</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase w-[100px]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {session.inspectionItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  depth={0}
                  selectedId={selectedItem?.id ?? null}
                  expandedIds={expandedIds}
                  onSelect={(i) => handleSelectItem(i)}
                  onToggle={handleToggle}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Checklist Form */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
          {selectedItem ? (
            <QaChecklistForm
              key={selectedItem.id}
              inspectionItem={selectedItem}
              checklistItems={checklistItems}
              itemMasterOptions={itemMasterOptions}
              onSave={handleSaveItem}
              saving={saving}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaShieldAlt className="text-5xl mb-3 text-gray-200" />
              <p className="text-sm font-medium">Select an item from the list to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QaInspectionFormPage;
