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

const LocationStockChart: React.FC = () => {
  // Sample data for the chart
  const data = [
    { name: "Main Warehouse", value: 185240, color: "#2563eb" },
    { name: "Raw Materials Store", value: 96320, color: "#16a34a" },
    { name: "Component Store", value: 82450, color: "#ca8a04" },
    { name: "Finished Goods Store", value: 54780, color: "#0ea5e9" },
    { name: "Tool Room", value: 9772, color: "#dc2626" },
  ];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip />
          <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LocationStockChart;
