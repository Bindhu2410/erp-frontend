import React, { useMemo, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  registerUser,
  RegisterUserRequest,
  getUnassignedUsers,
  getPagedRoles,
  assignRoleToUser,
  getUserRoles,
} from "../../services/user.service";
import { deleteUserRoleAssignmentById } from "../../services/user.service";
import { FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";
import { LiaUserEditSolid } from "react-icons/lia";
import { UserRoleChart } from "../../components/user-management";
import EditUserModal from "../../components/user-management/EditUserModal";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  status: "Active" | "Inactive";
  avatar: string;
}

// Removed unused Permission interface (legacy)

interface HierarchyNode {
  name: string;
  role: string;
  team: string;
  icon: string;
  badgeColor: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation error
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Edit user profile modal
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState<any | null>(null);

  // Registration form state
  const [registerForm, setRegisterForm] = useState<RegisterUserRequest>({
    Username: "",
    Email: "",
    FirstName: "",
    LastName: "",
    Password: "",
    ConfirmPassword: "",
    PhoneNumber: "",
    ProfileImageUrl: "",
    PreferredLanguage: "",
    TimeZone: "",
    TwoFactorEnabled: false,
    Notes: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Assign Role Modal state
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [assignRoleLoading, setAssignRoleLoading] = useState(false);
  const [assignRoleError, setAssignRoleError] = useState<string | null>(null);
  const [assignRoleSuccess, setAssignRoleSuccess] = useState<string | null>(
    null,
  );
  const [assignUserId, setAssignUserId] = useState<number | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<number | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  // User roles state for dropdown
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [userRolesLoading, setUserRolesLoading] = useState(false);
  const [userRolesError, setUserRolesError] = useState<string | null>(null);
  const roles = Array.from(
    new Set(userRoles.map((ur: any) => ur.roleName).filter(Boolean)),
  );
  const roleDistributionData = useMemo(() => {
    const counts = new Map<string, number>();

    userRoles.forEach((ur: any) => {
      const roleName = ur.roleName;
      if (!roleName) {
        return;
      }
      counts.set(roleName, (counts.get(roleName) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [userRoles]);
  // Feedback for delete user-role assignment
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingDeleteUserRoleId, setPendingDeleteUserRoleId] = useState<
    number | null
  >(null);

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? selectedUser : user,
        ),
      );
      setShowEditModal(false);
      setSelectedUser(null);
    }
  };

  const openAssignRoleModal = async () => {
    setAssignRoleError(null);
    setAssignRoleSuccess(null);
    setAssignUserId(null);
    setAssignRoleId(null);
    setShowAssignRoleModal(true);
    try {
      // Use service functions for API calls
      const usersRes = await getUnassignedUsers();
      setUsersList(usersRes.data || []);
      const rolesRes = await getPagedRoles(1, 10);
      setRolesList(
        rolesRes.data && rolesRes.data.roles ? rolesRes.data.roles : [],
      );
    } catch (err: any) {
      setAssignRoleError("Failed to load users or roles.");
    }
  };

  // Fetch user roles helper function
  const fetchUserRoles = async () => {
    setUserRolesLoading(true);
    setUserRolesError(null);
    try {
      const res = await getUserRoles();
      if (res && res.data) setUserRoles(res.data);
      else setUserRoles([]);
    } catch (err) {
      setUserRolesError("Failed to load role distribution data.");
      setUserRoles([]);
    } finally {
      setUserRolesLoading(false);
    }
  };

  // Fetch user roles on mount
  React.useEffect(() => {
    fetchUserRoles();
  }, []);

  // User dropdown for user-role assignments (binds to API response structure)
  // Removed unused legacy dropdown state for user-role assignments

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Members & Permissions
        </h2>
        <div className="flex items-center">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiUserPlus size={16} />
            Register User
          </button>
          <button
            onClick={openAssignRoleModal}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-2"
          >
            <FiUsers size={16} />
            Assign Role
          </button>
        </div>
      </div>

      {/* Users & Roles Table (API bound) */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h3 className="text-lg font-medium text-gray-900">Users & Roles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Delete feedback messages */}
              {deleteError && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-2 text-red-600 text-center bg-red-50"
                  >
                    {deleteError}
                  </td>
                </tr>
              )}
              {deleteSuccess && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-2 text-green-600 text-center bg-green-50"
                  >
                    {deleteSuccess}
                  </td>
                </tr>
              )}
              {userRoles.map((ur: any) => (
                <tr key={ur.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ur.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ur.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ur.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white bg-blue-500">
                      {ur.roleName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {ur.roleDescription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ur.dateAssigned
                      ? new Date(ur.dateAssigned).toLocaleString()
                      : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                    <button
                      className="text-green-600 hover:text-green-800"
                      title="Update User"
                      onClick={() => {
                        setEditUserData(ur);
                        setShowEditUserModal(true);
                      }}
                    >
                      <LiaUserEditSolid size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      title="Delete User Role"
                      onClick={() => {
                        const userroleid = ur.id || ur.userroleid || ur.Id;
                        setPendingDeleteUserRoleId(userroleid);
                        setShowDeleteConfirmModal(true);
                      }}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                  {/* Delete Confirmation Modal (should be outside the table, only once per page) */}
                  {showDeleteConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4 text-red-600">
                          Confirm Delete
                        </h2>
                        <p className="mb-6 text-gray-700">
                          Are you sure you want to delete this user-role
                          assignment? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                          <button
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={() => {
                              setShowDeleteConfirmModal(false);
                              setPendingDeleteUserRoleId(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            onClick={async () => {
                              if (pendingDeleteUserRoleId) {
                                try {
                                  const res =
                                    await deleteUserRoleAssignmentById(
                                      pendingDeleteUserRoleId,
                                    );
                                  if (res.status === true) {
                                    toast.success(
                                      res.message ||
                                        "User-role assignment deleted successfully!",
                                    );
                                    await fetchUserRoles();
                                  } else {
                                    toast.error(
                                      res.message ||
                                        "Failed to delete user-role assignment.",
                                    );
                                  }
                                } catch (err: any) {
                                  toast.error(
                                    err?.response?.data?.message ||
                                      "Failed to delete user-role assignment.",
                                  );
                                }
                              }
                              setShowDeleteConfirmModal(false);
                              setPendingDeleteUserRoleId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit User Role Modal removed — merged into EditUserModal */}

      {/* Charts Section */}
      <div className="mb-6">
        <UserRoleChart
          data={roleDistributionData}
          loading={userRolesLoading}
          error={userRolesError}
        />
      </div>

      {/* Register User Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Register New User</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setRegisterLoading(true);
                setRegisterError(null);
                setRegisterSuccess(null);
                setPasswordError(null);
                setConfirmPasswordError(null);
                const pwd = registerForm.Password;
                const confirmPwd = registerForm.ConfirmPassword;
                let confirmPwdError = null;
                if (pwd !== confirmPwd) {
                  confirmPwdError = "Passwords do not match.";
                }
                setConfirmPasswordError(confirmPwdError);
                if (confirmPwdError) {
                  setRegisterLoading(false);
                  return;
                }
                try {
                  const res = await registerUser(registerForm);
                  if (res.success) {
                    toast.success(res.message || "User registered successfully!");
                    setShowRegisterModal(false);
                    setRegisterForm({
                      Username: "",
                      Email: "",
                      FirstName: "",
                      LastName: "",
                      Password: "",
                      ConfirmPassword: "",
                      PhoneNumber: "",
                      ProfileImageUrl: "",
                      PreferredLanguage: "",
                      TimeZone: "",
                      TwoFactorEnabled: false,
                      Notes: "",
                    });
                    fetchUserRoles();
                  } else {
                    const errorMsg = res.message || "Registration failed.";
                    setRegisterError(errorMsg);
                    toast.error(errorMsg);
                  }
                } catch (err: any) {
                    const errorMsg = err?.response?.data?.message || "Registration failed.";
                    setRegisterError(errorMsg);
                    toast.error(errorMsg);
                } finally {
                  setRegisterLoading(false);
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerForm.Username}
                    onChange={(e) =>
                      setRegisterForm((f) => ({
                        ...f,
                        Username: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerForm.Email}
                    onChange={(e) =>
                      setRegisterForm((f) => ({ ...f, Email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerForm.FirstName}
                    onChange={(e) =>
                      setRegisterForm((f) => ({
                        ...f,
                        FirstName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerForm.LastName}
                    onChange={(e) =>
                      setRegisterForm((f) => ({
                        ...f,
                        LastName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${passwordError ? "border-red-500" : ""}`}
                      value={registerForm.Password}
                      onChange={(e) => {
                        setRegisterForm((f) => ({
                          ...f,
                          Password: e.target.value,
                        }));
                        setPasswordError(null);
                      }}
                      required
                    />
                    <span
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={0}
                      role="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                  {passwordError && (
                    <div className="text-red-600 text-xs mt-1">
                      {passwordError}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${confirmPasswordError ? "border-red-500" : ""}`}
                      value={registerForm.ConfirmPassword}
                      onChange={(e) => {
                        setRegisterForm((f) => ({
                          ...f,
                          ConfirmPassword: e.target.value,
                        }));
                        setConfirmPasswordError(null);
                      }}
                      required
                    />
                    <span
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={0}
                      role="button"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                  {confirmPasswordError && (
                    <div className="text-red-600 text-xs mt-1">
                      {confirmPasswordError}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={registerForm.PhoneNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setRegisterForm((f) => ({
                        ...f,
                        PhoneNumber: value,
                      }));
                    }}
                    maxLength={10}
                    placeholder="Enter 10 digit phone number"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={registerForm.ProfileImageUrl} onChange={e => setRegisterForm(f => ({...f, ProfileImageUrl: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={registerForm.PreferredLanguage} onChange={e => setRegisterForm(f => ({...f, PreferredLanguage: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={registerForm.TimeZone} onChange={e => setRegisterForm(f => ({...f, TimeZone: e.target.value}))} />
                </div>
                <div className="flex items-center mt-6">
                  <input type="checkbox" id="twoFactor" checked={registerForm.TwoFactorEnabled} onChange={e => setRegisterForm(f => ({...f, TwoFactorEnabled: e.target.checked}))} className="mr-2" />
                  <label htmlFor="twoFactor" className="text-sm font-medium text-gray-700">Two Factor Enabled</label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={registerForm.Notes} onChange={e => setRegisterForm(f => ({...f, Notes: e.target.value}))} />
                </div> */}
              </div>
              {registerError && (
                <div className="text-red-600 mt-3">{registerError}</div>
              )}
              {registerSuccess && (
                <div className="text-green-600 mt-3">{registerSuccess}</div>
              )}
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setRegisterError(null);
                    setRegisterSuccess(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={registerLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={registerLoading}
                >
                  {registerLoading ? "Registering..." : "Register User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team/Region
                </label>
                <input
                  type="text"
                  value={selectedUser.team}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, team: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      status: e.target.value as "Active" | "Inactive",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Assign Role to User</h2>
            {/* Feedback messages removed, handled by toastify */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAssignRoleLoading(true);
                setAssignRoleError(null);
                setAssignRoleSuccess(null);
                try {
                  if (!assignUserId || !assignRoleId) {
                    toast.error("Please select both user and role.");
                    setAssignRoleError("Please select both user and role.");
                    setAssignRoleLoading(false);
                    return;
                  }
                  // For demo, AssignedBy is 1 (admin)
                  const res = await assignRoleToUser(
                    assignRoleId,
                    assignUserId,
                    1,
                  );
                  if (res.success === true || res.status === true) {
                    toast.success("Role assigned successfully!");
                    setShowAssignRoleModal(false);
                    // Refetch user roles table data after successful assignment
                    if (typeof fetchUserRoles === "function") {
                      fetchUserRoles();
                    }
                  } else {
                    toast.error(res.message || "Failed to assign role.");
                    setAssignRoleError(res.message || "Failed to assign role.");
                  }
                } catch (err: any) {
                  toast.error(
                    err?.response?.data?.message || "Failed to assign role.",
                  );
                  setAssignRoleError(
                    err?.response?.data?.message || "Failed to assign role.",
                  );
                } finally {
                  setAssignRoleLoading(false);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assignUserId || ""}
                  onChange={(e) => setAssignUserId(Number(e.target.value))}
                  required
                >
                  <option value="">Select User</option>
                  {/* Bind to unassigned users API response for user dropdown */}
                  {usersList.map((user: any) => (
                    <option key={user.userId} value={user.userId}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assignRoleId || ""}
                  onChange={(e) => setAssignRoleId(Number(e.target.value))}
                  required
                >
                  <option value="">Select Role</option>
                  {/* Bind to paged roles API response for role dropdown */}
                  {rolesList.map((role: any) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAssignRoleModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={assignRoleLoading}
                >
                  {assignRoleLoading ? "Assigning..." : "Assign Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Profile Modal */}
      {showEditUserModal && editUserData && (
        <EditUserModal
          user={{
            userId: editUserData.userId,
            username: editUserData.username,
            email: editUserData.email,
            roleAssignmentId: editUserData.id || editUserData.userroleid || editUserData.Id,
            currentRoleId: editUserData.roleId,
            dateAssigned: editUserData.dateAssigned,
            assignedBy: editUserData.assignedBy || 1,
          }}
          onClose={() => {
            setShowEditUserModal(false);
            setEditUserData(null);
          }}
          onSuccess={fetchUserRoles}
        />
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

export default UserManagement;
