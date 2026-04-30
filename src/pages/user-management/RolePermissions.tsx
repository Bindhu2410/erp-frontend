import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiCheck, FiX, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { PermissionsOverviewChart } from "../../components/user-management";
import { createRole, getPermissions } from "../../services/user.service";
import { useRolePermissionAnalytics } from "../../hooks/user-management/useRolePermissionAnalytics";

interface Permission {
  permissionId: number;
  permissionName: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const RolePermissions: React.FC = () => {
  const {
    records: rolesPermissions,
    loading: rolesLoading,
    error: rolesError,
    permissionsChartData,
    permissionKeys,
    refetch: refetchRolesPermissions,
  } = useRolePermissionAnalytics();

  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const fetchAvailablePermissions = async () => {
    setPermissionsLoading(true);
    try {
      const res = await getPermissions(1, 100);
      if (res.status && res.data && res.data.permissions) {
        setAvailablePermissions(res.data.permissions);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailablePermissions();
  }, []);

  // Use all available permissions for the matrix columns if fetched, otherwise derive from existing
  const permissions = availablePermissions.length > 0
    ? availablePermissions.map(p => {
        const normalizedName = p.permissionName.replace(/\./g, " ");
        return {
          id: normalizedName,
          name: normalizedName,
          description: p.description
        };
      })
    : Array.from(
        new Map(
          rolesPermissions.map((rp) => {
            const formatted = rp.permissionName.replace(/\./g, " ");
            return [
              formatted,
              {
                id: formatted,
                name: formatted,
                description: "", // description removed
              },
            ];
          }),
        ).values(),
      );

  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  // Add state for loading, error, and success for role creation
  const [addRoleLoading, setAddRoleLoading] = useState(false);
  const [addRoleError, setAddRoleError] = useState<string | null>(null);
  const [addRoleSuccess, setAddRoleSuccess] = useState<string | null>(null);

  // Removed unused legacy handlers for local role/permission state

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddRoleLoading(true);
    setAddRoleError(null);
    setAddRoleSuccess(null);
    try {
      const payload = {
        RoleName: newRole.name,
        PermissionNames: newRole.permissions,
        Description: newRole.description,
        IsSystemRole: false, // or true if needed
        CreatedBy: 1, // Replace with actual user id if available
      };
      const res = await createRole(payload);
      if (
        res.roleId &&
        res.message &&
        res.message.toLowerCase().includes("success")
      ) {
        toast.success(res.message);
        setNewRole({ name: "", description: "", permissions: [] });
        setShowAddRoleModal(false);
        // Refetch roles and permissions matrix from API so matrix and charts update
        await refetchRolesPermissions();
      } else {
        toast.error(res.message || "Failed to create role.");
        setAddRoleError(res.message || "Failed to create role.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create role.");
      setAddRoleError(err?.response?.data?.message || "Failed to create role.");
    } finally {
      setAddRoleLoading(false);
    }
  };

  // Calculate permissions data for charts
  const getPermissionsData = () => {
    const permissionTypes = ["view", "edit", "approve", "admin"];

    return permissionTypes.map((permType) => ({
      name: permType.charAt(0).toUpperCase() + permType.slice(1),
      data: Array.from(
        new Map(rolesPermissions.map((rp) => [rp.roleId, rp])),
      ).map(([roleId, roleObj]) => {
        const permissionsForRole = rolesPermissions
          .filter((rp) => rp.roleId === roleId && rp.hasPermission)
          .map((rp) => rp.permissionName);
        return permissionsForRole.includes(permType) ? 1 : 0;
      }),
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Roles & Permissions
          </h2>
          <p className="text-gray-600">
            Manage user roles and their associated permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddRoleModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={16} />
          Add Role
        </button>
      </div>

      {/* Roles & Permissions Matrix */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Permission Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          {rolesLoading ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : rolesError ? (
            <div className="p-4 text-red-600">{rolesError}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  {permissions.map((permission) => (
                    <th
                      key={permission.id}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex flex-col items-center">
                        <th
                          key={permission.id}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase"
                        >
                          {permission.name}
                        </th>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Group by role, then show permissions as columns */}
                {Array.from(
                  new Map(rolesPermissions.map((rp) => [rp.roleId, rp])),
                ).map(([roleId, roleObj]) => {
                  const perms = rolesPermissions.filter(
                    (rp) => rp.roleId === roleId,
                  );
                  const permMap: Record<string, boolean> = {};
                  perms.forEach((p) => {
                    const key = p.permissionName.replace(/\./g, " ");
                    permMap[key] = p.hasPermission;
                  });

                  return (
                    <tr key={roleId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                        {roleObj.roleName}
                      </td>
                      {permissions.map((permission) => (
                        <td
                          key={permission.id}
                          className="px-6 py-4 whitespace-nowrap text-center"
                        >
                          {permMap[permission.id] ? (
                            <FiCheck
                              className="text-green-600 mx-auto"
                              size={16}
                            />
                          ) : (
                            <FiX className="text-red-400 mx-auto" size={16} />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Permissions Overview */}
      <div className="mb-6">
        <PermissionsOverviewChart
          data={permissionsChartData}
          permissionKeys={permissionKeys}
          loading={rolesLoading}
          error={rolesError}
        />
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-4">
            <h2 className="text-lg font-bold mb-3">Add New Role</h2>
            <form onSubmit={handleAddRole}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter role description"
                  rows={2}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Permissions (Categorized)
                </label>
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 border rounded-lg p-3 bg-gray-50">
                  {permissionsLoading ? (
                    <div className="text-sm text-gray-500">Loading permissions...</div>
                  ) : availablePermissions.length === 0 ? (
                    <div className="text-sm text-gray-500">No permissions found.</div>
                  ) : (
                    Object.entries(
                      availablePermissions.reduce((acc, curr) => {
                        if (!acc[curr.category]) acc[curr.category] = [];
                        acc[curr.category].push(curr);
                        return acc;
                      }, {} as Record<string, Permission[]>)
                    ).map(([category, perms]) => (
                      <div key={category} className="space-y-1">
                        <h4 className="text-xs font-bold text-blue-600 uppercase border-b pb-1">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                          {perms.map((permission) => (
                            <label key={permission.permissionId} className="flex items-start group cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newRole.permissions.includes(permission.permissionName)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRole({
                                      ...newRole,
                                      permissions: [
                                        ...newRole.permissions,
                                        permission.permissionName,
                                      ],
                                    });
                                  } else {
                                    setNewRole({
                                      ...newRole,
                                      permissions: newRole.permissions.filter(
                                        (p) => p !== permission.permissionName,
                                      ),
                                    });
                                  }
                                }}
                                className="mt-1 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                                  {permission.permissionName.replace(/\./g, " ")}
                                </span>
                                {permission.description && (
                                  <span className="text-[10px] text-gray-400">
                                    {permission.description}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={addRoleLoading}
                >
                  {addRoleLoading ? "Adding..." : "Add Role"}
                </button>
              </div>
              {addRoleError && (
                <div className="text-red-600 mt-2 text-sm">{addRoleError}</div>
              )}
              {addRoleSuccess && (
                <div className="text-green-600 mt-2 text-sm">
                  {addRoleSuccess}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default RolePermissions;
