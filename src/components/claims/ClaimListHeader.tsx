import React from "react";
import ClaimStatusCard from "./ClaimStatusCard";
import { FaSearch, FaUsers, FaFileAlt, FaHandshake } from "react-icons/fa";

const claimStatusData = [
  {
    title: "Submitted",
    value: 2,
    description: "Claims submitted this week",
    color: "blue",
    icon: <FaSearch />,
  },
  {
    title: "Approved",
    value: 1,
    description: "Claims approved",
    color: "green",
    icon: <FaUsers />,
  },
  {
    title: "Rejected",
    value: 0,
    description: "Claims rejected",
    color: "yellow",
    icon: <FaFileAlt />,
  },
  {
    title: "Pending",
    value: 1,
    description: "Claims pending approval",
    color: "purple",
    icon: <FaHandshake />,
  },
];

const ClaimListHeader: React.FC = () => (
  <div className="flex flex-col md:flex-row items-center justify-between mb-6">
    <h1 className="text-2xl font-bold mb-4 md:mb-0">Claim List</h1>
    <div className="flex items-center gap-2">
      <select className="border rounded px-3 py-2 text-sm">
        <option>Sort by: Latest First</option>
        <option>Sort by: Oldest First</option>
      </select>
      <button className="border rounded px-3 py-2 text-sm">Export as</button>
      <button className="bg-orange-500 text-white px-4 py-2 rounded shadow hover:bg-orange-600 text-sm font-semibold">Create Claim</button>
    </div>
  </div>
);

const ClaimListCards: React.FC = () => (
  <div className="flex flex-wrap gap-4 mb-8">
    {claimStatusData.map((card, idx) => (
      <ClaimStatusCard key={idx} {...card} />
    ))}
  </div>
);

export { ClaimListHeader, ClaimListCards };
