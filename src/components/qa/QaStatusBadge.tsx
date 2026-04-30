import React from "react";
import type { QaItemStatus, QaSessionStatus, QaOverallResult } from "../../types/qa";

type StatusValue = QaItemStatus | QaSessionStatus | QaOverallResult | string;

interface QaStatusBadgeProps {
  status: StatusValue;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, string> = {
  // Item statuses
  Approved:      "bg-green-100 text-green-800",
  Failed:        "bg-red-100 text-red-800",
  Pending:       "bg-yellow-100 text-yellow-800",
  Missing:       "bg-orange-100 text-orange-800",
  WrongProduct:  "bg-purple-100 text-purple-700",
  // Session statuses
  "In-Progress": "bg-blue-100 text-blue-800",
  Completed:     "bg-green-100 text-green-800",
  // Payment
  FullApproved:  "bg-green-100 text-green-800",
  PartialHold:   "bg-yellow-100 text-yellow-800",
  FullHold:      "bg-red-100 text-red-800",
  // Result
  Partial:       "bg-orange-100 text-orange-800",
};

const STATUS_LABELS: Record<string, string> = {
  WrongProduct:  "Wrong Product",
  "In-Progress": "In Progress",
  FullApproved:  "Full Approved",
  PartialHold:   "Partial Hold",
  FullHold:      "Full Hold",
};

const QaStatusBadge: React.FC<QaStatusBadgeProps> = ({ status, size = "sm" }) => {
  const styles = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";
  const label  = STATUS_LABELS[status] ?? status;
  const padding = size === "md" ? "px-3 py-1 text-sm" : "px-2 text-xs leading-5";

  return (
    <span className={`inline-flex font-semibold rounded-full ${padding} ${styles}`}>
      {label}
    </span>
  );
};

export default QaStatusBadge;
