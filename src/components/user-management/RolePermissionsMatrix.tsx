import React from 'react';
import { FiCheck, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface RolePermissionsMatrixProps {
  roles: Role[];
  permissions: Permission[];
  onPermissionToggle: (roleId: string, permissionId: string) => void;
  onDeleteRole: (roleId: string) => void;
  onEditRole?: (role: Role) => void;
}

const RolePermissionsMatrix: React.FC<RolePermissionsMatrixProps> = ({
  roles,
  permissions,
  onPermissionToggle,
  onDeleteRole,
  onEditRole
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b">
        <h3 className="text-lg font-medium text-gray-900">Permission Matrix</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              {permissions.map((permission) => (
                <th key={permission.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center">
                    <span>{permission.name}</span>
                    <span className="text-xs text-gray-400 normal-case">{permission.description}</span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </div>
                </td>
                {permissions.map((permission) => (
                  <td key={permission.id} className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onPermissionToggle(role.id, permission.id)}
                      className={`p-2 rounded-full transition-colors ${
                        role.permissions.includes(permission.id)
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {role.permissions.includes(permission.id) ? (
                        <FiCheck size={16} />
                      ) : (
                        <FiX size={16} />
                      )}
                    </button>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-2">
                    {onEditRole && (
                      <button
                        onClick={() => onEditRole(role)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit Role"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Role"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolePermissionsMatrix;
