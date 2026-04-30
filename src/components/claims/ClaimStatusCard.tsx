import React from "react";
import { FaSearch, FaUsers, FaFileAlt, FaHandshake } from "react-icons/fa";

interface ClaimStatusCardProps {
  title: string;
  value: number;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const ClaimStatusCard: React.FC<ClaimStatusCardProps> = ({ title, value, description, color, icon }) => (
  <div className={`rounded-lg p-6 shadow bg-${color}-100 flex-1 min-w-[200px] mx-2`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`font-semibold text-${color}-800`}>{title}</span>
      <span className={`text-2xl text-${color}-700`}>{icon}</span>
    </div>
    <div className={`text-3xl font-bold text-${color}-800 mb-1`}>{value}</div>
    <div className={`text-sm text-${color}-700`}>{description}</div>
  </div>
);

export default ClaimStatusCard;
