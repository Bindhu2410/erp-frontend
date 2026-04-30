import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TransactionTrendChart: React.FC = () => {
  // Sample data matching the chart in the image
  const data = [
    { date: "Apr 3", receipts: 12, issues: 8, transfers: 5 },
    { date: "Apr 6", receipts: 14, issues: 9, transfers: 7 },
    { date: "Apr 9", receipts: 10, issues: 11, transfers: 4 },
    { date: "Apr 12", receipts: 15, issues: 6, transfers: 8 },
    { date: "Apr 15", receipts: 8, issues: 10, transfers: 6 },
    { date: "Apr 18", receipts: 10, issues: 15, transfers: 9 },
    { date: "Apr 21", receipts: 16, issues: 10, transfers: 5 },
    { date: "Apr 24", receipts: 12, issues: 13, transfers: 5 },
    { date: "Apr 27", receipts: 14, issues: 9, transfers: 9 },
    { date: "Apr 30", receipts: 18, issues: 14, transfers: 10 },
    { date: "May 3", receipts: 15, issues: 12, transfers: 6 },
  ];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{
              value: "Date",
              position: "insideBottom",
              offset: -5,
              fontSize: 12,
              fill: "#6b7280",
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{
              value: "Number of Transactions",
              angle: -90,
              position: "insideLeft",
              fontSize: 12,
              fill: "#6b7280",
            }}
            domain={[0, 20]}
            ticks={[0, 5, 10, 15, 20]}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="receipts"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="issues"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="transfers"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionTrendChart;
