import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRolesWithPermissions } from '../../services/user.service';

export interface RolePermissionRecord {
  roleId: string | number;
  roleName: string;
  permissionName: string;
  hasPermission: boolean;
  roleDescription?: string;
}

const normalizePermissionName = (name?: string): string => {
  if (!name) {
    return 'Unknown Permission';
  }

  return name
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .trim();
};

const toTitleCase = (value: string): string => {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const useRolePermissionAnalytics = () => {
  const [records, setRecords] = useState<RolePermissionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRolesWithPermissions();
      const payload = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const normalized: RolePermissionRecord[] = payload
        .filter((item: any) => item?.roleName)
        .map((item: any) => ({
          roleId: item.roleId,
          roleName: item.roleName,
          permissionName: normalizePermissionName(item.permissionName),
          hasPermission: Boolean(item.hasPermission),
          roleDescription: item.roleDescription
        }));

      setRecords(normalized);
    } catch (requestError) {
      setError('Unable to load role analytics right now. Please try again.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const roles = useMemo(() => {
    const map = new Map<string | number, { id: string | number; name: string; description?: string }>();

    records.forEach((record) => {
      if (!map.has(record.roleId)) {
        map.set(record.roleId, {
          id: record.roleId,
          name: record.roleName,
          description: record.roleDescription
        });
      }
    });

    return Array.from(map.values());
  }, [records]);

  const roleDistributionData = useMemo(() => {
    return roles.map((role) => ({
      name: role.name,
      value: records.filter((record) => record.roleId === role.id && record.hasPermission).length
    }));
  }, [records, roles]);

  const permissionKeys = useMemo(() => {
    const unique = new Set<string>();
    records.forEach((record) => {
      if (record.permissionName) {
        unique.add(toTitleCase(record.permissionName));
      }
    });
    return Array.from(unique);
  }, [records]);

  const permissionsChartData = useMemo(() => {
    return roles.map((role) => {
      const roleRecords = records.filter((record) => record.roleId === role.id);
      const row: Record<string, string | number> = { roleName: role.name };

      permissionKeys.forEach((permission) => {
        const hasPermission = roleRecords.some(
          (record) => toTitleCase(record.permissionName) === permission && record.hasPermission
        );
        row[permission] = hasPermission ? 1 : 0;
      });

      return row;
    });
  }, [permissionKeys, records, roles]);

  return {
    roles,
    records,
    loading,
    error,
    roleDistributionData,
    permissionsChartData,
    permissionKeys,
    refetch
  };
};
