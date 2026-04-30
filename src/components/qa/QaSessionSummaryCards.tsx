import React from "react";

interface SummaryItem {
  label: string;
  count: number;
  color: string;
  bg: string;
}

interface QaSessionSummaryCardsProps {
  totalItems: number;
  totalSubItems?: number;
  approved: number;
  failed: number;
  missing: number;
  wrongProduct: number;
  pending: number;
}

const QaSessionSummaryCards: React.FC<QaSessionSummaryCardsProps> = ({
  totalItems,
  totalSubItems = 0,
  approved,
  failed,
  missing,
  wrongProduct,
  pending,
}) => {
  const cards: SummaryItem[] = [
    { label: "Total Items",    count: totalItems + totalSubItems, color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
    { label: "Approved",       count: approved,                   color: "text-green-700",  bg: "bg-green-50 border-green-200" },
    { label: "Failed",         count: failed,                     color: "text-red-700",    bg: "bg-red-50 border-red-200" },
    { label: "Missing",        count: missing,                    color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
    { label: "Wrong Product",  count: wrongProduct,               color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    { label: "Pending",        count: pending,                    color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 flex flex-col items-center ${card.bg}`}
        >
          <span className={`text-3xl font-bold ${card.color}`}>{card.count}</span>
          <span className="text-xs text-gray-600 mt-1 text-center font-medium">{card.label}</span>
        </div>
      ))}
    </div>
  );
};

export default QaSessionSummaryCards;
