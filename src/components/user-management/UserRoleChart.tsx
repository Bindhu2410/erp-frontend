import React, { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { roleColors } from './chartColors';

interface UserRoleDatum {
  name: string;
  value: number;
}

interface UserRoleChartProps {
  data: UserRoleDatum[];
  loading?: boolean;
  error?: string | null;
}

const buildFallbackColors = (count: number): string[] => {
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const hue = Math.round((360 / count) * index);
    return `hsl(${hue}, 55%, 76%)`;
  });
};

const UserRoleTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const current = payload[0];
  const roleName = current.name;
  const roleCount = Number(current.value) || 0;
  const markerColor = current.color || '#10B981';

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-2 text-sm text-gray-800">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: markerColor }} />
        <span className="font-medium">{roleName}</span>
        <span>{roleCount}</span>
      </div>
    </div>
  );
};

const UserRoleChart: React.FC<UserRoleChartProps> = ({ data, loading = false, error = null }) => {
  const hasData = data.some((item) => item.value > 0);
  const fallbackColors = useMemo(() => buildFallbackColors(data.length), [data.length]);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="text-base font-medium text-gray-700">User Distribution by Role</h3>
      </div>

      <div className="p-6 h-[360px]">
        {loading && (
          <div className="animate-pulse h-full flex flex-col justify-center gap-4">
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto" />
            <div className="h-40 w-40 bg-gray-200 rounded-full mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        )}

        {!loading && error && (
          <div className="h-full flex items-center justify-center text-center text-red-600 px-4">
            {error}
          </div>
        )}

        {!loading && !error && !hasData && (
          <div className="h-full flex items-center justify-center text-center text-gray-500 px-4">
            No role distribution data is available.
          </div>
        )}

        {!loading && !error && hasData && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={110}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={roleColors[entry.name] || fallbackColors[index]} />
                ))}
              </Pie>
              <Tooltip content={<UserRoleTooltip />} />
              <Legend verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default UserRoleChart;
