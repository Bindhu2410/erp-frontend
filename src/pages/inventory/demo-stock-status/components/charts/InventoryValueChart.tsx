import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const InventoryValueChart: React.FC = () => {
  // Data with percentages matching the image
  const data = [
    { name: "Raw Materials", value: 30.1, color: "#3b82f6" }, // Blue
    { name: "Finished Goods", value: 38.7, color: "#22c55e" }, // Green
    { name: "Components", value: 12.7, color: "#eab308" }, // Yellow/Gold
    { name: "Work in Progress", value: 12.2, color: "#0ea5e9" }, // Light Blue
    { name: "Tools & Equipment", value: 6.4, color: "#ef4444" }, // Red
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const renderColorfulLegendText = (value: string, entry: any) => {
    return <span className="text-gray-800 text-sm">{value}</span>;
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={60}
              outerRadius={120}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              formatter={renderColorfulLegendText}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryValueChart;
