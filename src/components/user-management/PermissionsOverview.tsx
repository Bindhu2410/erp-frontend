import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { permissionColors } from './chartColors';

interface PermissionsOverviewProps {
  data: Array<Record<string, string | number>>;
  permissionKeys: string[];
  loading?: boolean;
  error?: string | null;
}

const GROUP_BASE_COLORS = ['#93C5FD', '#F9A8D4', '#A7F3D0', '#FDE68A', '#C4B5FD', '#BAE6FD', '#FCA5A5'];
const SHADE_STEPS = [0.82, 0.9, 1, 1.08, 1.16];

const normalizeGroupKey = (permissionName: string): string => {
  const [prefix] = permissionName.toLowerCase().split(' ');
  return prefix || permissionName.toLowerCase();
};

const normalizeActionKey = (permissionName: string): string => {
  const parts = permissionName.toLowerCase().split(' ').filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || '';
};

const toTitleCase = (value: string): string => {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ACTION_ORDER: Record<string, number> = {
  create: 0,
  read: 1,
  view: 2,
  update: 3,
  delete: 4,
  export: 5
};

const adjustHexBrightness = (hexColor: string, multiplier: number): string => {
  const sanitized = hexColor.replace('#', '');
  const safe = sanitized.length === 6 ? sanitized : '808080';
  const r = Math.max(0, Math.min(255, Math.round(parseInt(safe.substring(0, 2), 16) * multiplier)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(safe.substring(2, 4), 16) * multiplier)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(safe.substring(4, 6), 16) * multiplier)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const PermissionsTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const grantedPermissions = payload
    .filter((entry) => Number(entry.value) > 0)
    .map((entry) => entry.name)
    .filter(Boolean);

  if (grantedPermissions.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="mt-1 text-sm text-gray-500">No permissions assigned.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <div className="mt-1 text-sm text-gray-600">
        {grantedPermissions.join(', ')}
      </div>
    </div>
  );
};

const PermissionsOverviewChart: React.FC<PermissionsOverviewProps> = ({
  data,
  permissionKeys,
  loading = false,
  error = null
}) => {
  const hasData = data.length > 0 && permissionKeys.length > 0;
  const groupBaseColorMap = new Map<string, string>();
  const groupMembersMap = new Map<string, string[]>();

  permissionKeys.forEach((permission) => {
    const groupKey = normalizeGroupKey(permission);

    if (!groupBaseColorMap.has(groupKey)) {
      const colorIndex = groupBaseColorMap.size % GROUP_BASE_COLORS.length;
      groupBaseColorMap.set(groupKey, GROUP_BASE_COLORS[colorIndex]);
    }

    const members = groupMembersMap.get(groupKey) || [];
    members.push(permission);
    groupMembersMap.set(groupKey, members);
  });

  groupMembersMap.forEach((members, groupKey) => {
    members.sort((a, b) => {
      const actionA = normalizeActionKey(a);
      const actionB = normalizeActionKey(b);
      const orderA = ACTION_ORDER[actionA] ?? Number.MAX_SAFE_INTEGER;
      const orderB = ACTION_ORDER[actionB] ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.localeCompare(b);
    });
    groupMembersMap.set(groupKey, members);
  });

  const permissionColorMap = new Map<string, string>();
  permissionKeys.forEach((permission) => {
    const groupKey = normalizeGroupKey(permission);
    const baseColor = groupBaseColorMap.get(groupKey) || '#6B7280';
    const members = groupMembersMap.get(groupKey) || [permission];
    const shadeIndex = Math.min(members.indexOf(permission), SHADE_STEPS.length - 1);
    const shade = SHADE_STEPS[shadeIndex] || SHADE_STEPS[SHADE_STEPS.length - 1];
    const displayPermission = toTitleCase(permission);
    const configuredColor = permissionColors[displayPermission];

    permissionColorMap.set(permission, configuredColor || adjustHexBrightness(baseColor, shade));
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="text-base font-medium text-gray-700">Permissions Overview</h3>
      </div>

      <div className="p-6 h-[360px]">
        {loading && (
          <div className="animate-pulse h-full flex flex-col justify-center gap-4">
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto" />
            <div className="h-44 bg-gray-200 rounded" />
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
            No permission analytics data is available.
          </div>
        )}

        {!loading && !error && hasData && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="roleName"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<PermissionsTooltip />} />
              <Legend />
              {permissionKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="permissions"
                  fill={permissionColorMap.get(key) || GROUP_BASE_COLORS[index % GROUP_BASE_COLORS.length]}
                  radius={index === permissionKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PermissionsOverviewChart;
