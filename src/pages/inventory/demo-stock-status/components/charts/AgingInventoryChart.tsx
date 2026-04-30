import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AgingInventoryChart: React.FC = () => {
  // Sample data for the chart
  const data = [
    { name: "0-30 Days", value: 1250000, color: "#22c55e" },
    { name: "31-60 Days", value: 650000, color: "#eab308" },
    { name: "61-90 Days", value: 350000, color: "#f97316" },
    { name: "90+ Days", value: 208750, color: "#ef4444" },
  ];

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatTooltip = (value: number) => {
    return [`$${value.toLocaleString()}`, "Value"];
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="value" barSize={30} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgingInventoryChart;
