import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaSearch } from "react-icons/fa";
import type {
  QaChecklistItem,
  QaChecklistResponse,
  QaInspectionItem,
  QaItemStatus,
} from "../../types/qa";

interface ItemMasterOption {
  id: number;
  itemCode: string;
  itemName: string;
}

interface QaChecklistFormProps {
  inspectionItem: QaInspectionItem;
  checklistItems: QaChecklistItem[];
  itemMasterOptions: ItemMasterOption[];
  onSave: (
    itemId: number,
    receivedQty: number,
    responses: QaChecklistResponse[],
    isWrongProduct: boolean,
    wrongProductItemId: number | null,
    status: QaItemStatus,
    remarks: string
  ) => void;
  saving?: boolean;
}

const QaChecklistForm: React.FC<QaChecklistFormProps> = ({
  inspectionItem,
  checklistItems,
  itemMasterOptions,
  onSave,
  saving = false,
}) => {
  const [receivedQty, setReceivedQty] = useState<number>(inspectionItem.receivedQty);
  const [responses, setResponses] = useState<Record<number, QaChecklistResponse>>({});
  const [isWrongProduct, setIsWrongProduct] = useState<boolean>(inspectionItem.isWrongProduct);
  const [wrongProductItemId, setWrongProductItemId] = useState<number | null>(
    inspectionItem.wrongProductItemId ?? null
  );
  const [wrongItemSearch, setWrongItemSearch] = useState<string>(
    inspectionItem.wrongProductItemName ?? ""
  );
  const [showWrongItemDropdown, setShowWrongItemDropdown] = useState(false);
  const [remarks, setRemarks] = useState<string>(inspectionItem.remarks ?? "");

  // Reset form when selected item changes
  useEffect(() => {
    setReceivedQty(inspectionItem.receivedQty);
    setIsWrongProduct(inspectionItem.isWrongProduct);
    setWrongProductItemId(inspectionItem.wrongProductItemId ?? null);
    setWrongItemSearch(inspectionItem.wrongProductItemName ?? "");
    setRemarks(inspectionItem.remarks ?? "");

    const existing: Record<number, QaChecklistResponse> = {};
    inspectionItem.checklistResponses.forEach((r) => {
      existing[r.checklistItemId] = r;
    });
    setResponses(existing);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectionItem.id]);

  const handleResponse = (checklistItemId: number, value: "Pass" | "Fail" | "NA") => {
    setResponses((prev) => ({
      ...prev,
      [checklistItemId]: {
        ...(prev[checklistItemId] ?? { checklistItemId, remarks: "" }),
        response: value,
      },
    }));
  };

  const handleResponseRemark = (checklistItemId: number, remark: string) => {
    setResponses((prev) => ({
      ...prev,
      [checklistItemId]: {
        ...(prev[checklistItemId] ?? { checklistItemId, response: "" }),
        remarks: remark,
      },
    }));
  };

  const deriveStatus = (): QaItemStatus => {
    if (isWrongProduct) return "WrongProduct";
    if (receivedQty === 0) return "Missing";
    const vals = Object.values(responses).map((r) => r.response);
    if (vals.length === 0) return "Pending";
    if (vals.some((v) => v === "Fail")) return "Failed";
    if (vals.every((v) => v === "Pass" || v === "NA")) return "Approved";
    return "Pending";
  };

  const filteredWrongItems = itemMasterOptions.filter(
    (i) =>
      wrongItemSearch.length > 1 &&
      (i.itemName.toLowerCase().includes(wrongItemSearch.toLowerCase()) ||
        i.itemCode.toLowerCase().includes(wrongItemSearch.toLowerCase()))
  );

  const handleSave = () => {
    const status = deriveStatus();
    const responseList: QaChecklistResponse[] = Object.values(responses);
    onSave(
      inspectionItem.id,
      receivedQty,
      responseList,
      isWrongProduct,
      wrongProductItemId,
      status,
      remarks
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Item header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
            {inspectionItem.itemCode}
          </span>
          <span className="font-semibold text-gray-800 text-sm">{inspectionItem.itemName}</span>
          {inspectionItem.checklistTemplate && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {inspectionItem.checklistTemplate.templateName}
            </span>
          )}
        </div>
      </div>

      {/* Received Qty */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Received Qty <span className="text-gray-400">(Expected: {inspectionItem.expectedQty})</span>
        </label>
        <input
          type="number"
          min={0}
          value={receivedQty}
          onChange={(e) => setReceivedQty(Number(e.target.value))}
          className="w-28 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Wrong Product Toggle */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isWrongProduct}
            onChange={(e) => {
              setIsWrongProduct(e.target.checked);
              if (!e.target.checked) {
                setWrongProductItemId(null);
                setWrongItemSearch("");
              }
            }}
            className="w-4 h-4 accent-purple-600"
          />
          <FaExclamationTriangle className="text-purple-500" />
          <span className="text-sm font-medium text-purple-800">Wrong Product Received</span>
        </label>

        {isWrongProduct && (
          <div className="mt-3 relative">
            <label className="block text-xs font-medium text-purple-700 mb-1">
              Identify what was actually received:
            </label>
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search item by name or code..."
                value={wrongItemSearch}
                onChange={(e) => {
                  setWrongItemSearch(e.target.value);
                  setShowWrongItemDropdown(true);
                }}
                onFocus={() => setShowWrongItemDropdown(true)}
                className="w-full pl-8 pr-3 py-1.5 border border-purple-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            {showWrongItemDropdown && filteredWrongItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredWrongItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setWrongProductItemId(item.id);
                      setWrongItemSearch(`${item.itemCode} — ${item.itemName}`);
                      setShowWrongItemDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-mono text-xs text-gray-500 mr-2">{item.itemCode}</span>
                    {item.itemName}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checklist Items */}
      {checklistItems.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            QA Checklist
          </p>
          <div className="space-y-3">
            {checklistItems
              .sort((a, b) => a.sequence - b.sequence)
              .map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {item.sequence}. {item.checkPoint}
                      </span>
                      {item.isRequired && (
                        <span className="ml-1 text-red-500 text-xs">*</span>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>
                  {/* Pass / Fail / NA buttons */}
                  <div className="flex gap-2 mb-2">
                    {(["Pass", "Fail", "NA"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleResponse(item.id, opt)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                          responses[item.id]?.response === opt
                            ? opt === "Pass"
                              ? "bg-green-500 text-white border-green-500"
                              : opt === "Fail"
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-gray-400 text-white border-gray-400"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {/* Remark for Fail */}
                  {responses[item.id]?.response === "Fail" && (
                    <input
                      type="text"
                      placeholder="Describe the issue..."
                      value={responses[item.id]?.remarks ?? ""}
                      onChange={(e) => handleResponseRemark(item.id, e.target.value)}
                      className="w-full border border-red-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Remarks */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Overall Remarks</label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Any additional remarks..."
        />
      </div>

      {/* Auto-status preview */}
      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
        Auto-status preview:
        <span
          className={`px-2 py-0.5 rounded-full font-semibold ${
            deriveStatus() === "Approved"
              ? "bg-green-100 text-green-700"
              : deriveStatus() === "Failed"
              ? "bg-red-100 text-red-700"
              : deriveStatus() === "WrongProduct"
              ? "bg-purple-100 text-purple-700"
              : deriveStatus() === "Missing"
              ? "bg-orange-100 text-orange-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {deriveStatus() === "WrongProduct" ? "Wrong Product" : deriveStatus()}
        </span>
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition"
      >
        {saving ? "Saving..." : "Save Item Result"}
      </button>
    </div>
  );
};

export default QaChecklistForm;
