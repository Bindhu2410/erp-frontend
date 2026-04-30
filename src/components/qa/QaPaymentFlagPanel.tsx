import React, { useState, useEffect } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import type { QaPaymentFlag, QaPaymentStatus } from "../../types/qa";

interface QaPaymentFlagPanelProps {
  invoiceAmount?: number;
  paymentFlag?: QaPaymentFlag;
  onSave: (flag: QaPaymentFlag) => void;
  saving?: boolean;
}

const STATUS_OPTIONS: { value: QaPaymentStatus; label: string; color: string }[] = [
  { value: "FullApproved", label: "Full Approved",  color: "text-green-700" },
  { value: "PartialHold",  label: "Partial Hold",   color: "text-yellow-700" },
  { value: "FullHold",     label: "Full Hold",       color: "text-red-700" },
];

const QaPaymentFlagPanel: React.FC<QaPaymentFlagPanelProps> = ({
  invoiceAmount = 0,
  paymentFlag,
  onSave,
  saving = false,
}) => {
  const [approvedAmount, setApprovedAmount] = useState<number>(
    paymentFlag?.approvedAmount ?? invoiceAmount
  );
  const [holdAmount, setHoldAmount] = useState<number>(paymentFlag?.holdAmount ?? 0);
  const [status, setStatus] = useState<QaPaymentStatus>(
    paymentFlag?.status ?? "FullApproved"
  );
  const [reason, setReason] = useState<string>(paymentFlag?.reason ?? "");

  useEffect(() => {
    setHoldAmount(Math.max(0, invoiceAmount - approvedAmount));
    if (approvedAmount >= invoiceAmount) {
      setStatus("FullApproved");
    } else if (approvedAmount <= 0) {
      setStatus("FullHold");
    } else {
      setStatus("PartialHold");
    }
  }, [approvedAmount, invoiceAmount]);

  const handleSave = () => {
    onSave({ invoiceAmount, approvedAmount, holdAmount, status, reason });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FaIndianRupeeSign className="text-green-600" />
        <h3 className="font-semibold text-gray-800 text-sm">Payment Flag</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Invoice Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Amount</label>
          <input
            type="number"
            value={invoiceAmount}
            disabled
            className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-sm text-gray-600"
          />
        </div>

        {/* Approved Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Approved Amount</label>
          <input
            type="number"
            min={0}
            max={invoiceAmount}
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hold Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hold Amount</label>
          <input
            type="number"
            value={holdAmount}
            disabled
            className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-sm text-gray-600"
          />
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">Payment Status</label>
        <div className="flex gap-3 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="paymentStatus"
                value={opt.value}
                checked={status === opt.value}
                onChange={() => setStatus(opt.value)}
                className="accent-blue-600"
              />
              <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reason */}
      {(status === "PartialHold" || status === "FullHold") && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Reason for Hold</label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe why payment is being held..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition"
      >
        {saving ? "Saving..." : "Save Payment Flag"}
      </button>
    </div>
  );
};

export default QaPaymentFlagPanel;
