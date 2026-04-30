import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  updateUserProfile,
  UpdateUserProfileRequest,
  getUserById,
  getPagedRoles,
  editUserRoleAssignment,
} from "../../services/user.service";

interface EditUserModalProps {
  user: {
    userId: number;
    username: string;
    email: string;
    roleAssignmentId: number;
    currentRoleId: number;
    dateAssigned: string;
    assignedBy: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSuccess }) => {
  const [form, setForm] = useState<UpdateUserProfileRequest>({
    UserId: user.userId,
    Username: user.username || "",
    Email: user.email || "",
    FirstName: "",
    LastName: "",
    Password: "",
    PhoneNumber: "",
    Notes: "",
  });
  const [selectedRoleId, setSelectedRoleId] = useState<number>(user.currentRoleId);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const init = async () => {
      setFetching(true);
      try {
        const [profileRes, rolesRes] = await Promise.all([
          getUserById(user.userId),
          getPagedRoles(1, 100),
        ]);
        const d = profileRes.data || profileRes;
        setForm({
          UserId: user.userId,
          Username: d.username || user.username || "",
          Email: d.email || user.email || "",
          FirstName: d.firstName || "",
          LastName: d.lastName || "",
          Password: "",
          PhoneNumber: d.phoneNumber || "",
          Notes: d.notes || "",
        });
        setRolesList(rolesRes.data?.roles || rolesRes.data || []);
      } catch {
        setForm((f) => ({ ...f, Username: user.username || "", Email: user.email || "" }));
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [user.userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Username.trim() || !form.Email.trim()) {
      toast.error("Username and Email are required.");
      return;
    }
    if (form.Password && form.Password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Run both updates in parallel
      const profilePayload: UpdateUserProfileRequest = { ...form };
      if (!profilePayload.Password) delete profilePayload.Password;

      let dateAssigned = user.dateAssigned;
      if (!dateAssigned) dateAssigned = new Date().toISOString();
      else dateAssigned = new Date(dateAssigned).toISOString();

      const [profileRes, roleRes] = await Promise.all([
        updateUserProfile(profilePayload),
        editUserRoleAssignment({
          Id: user.roleAssignmentId,
          UserId: user.userId,
          RoleId: selectedRoleId,
          AssignedBy: user.assignedBy || 1,
          DateAssigned: dateAssigned,
        }),
      ]);

      const profileOk = profileRes.success === true || profileRes.status === true || profileRes.message?.toLowerCase().includes("success");
      const roleOk = roleRes.status === true || roleRes.success === true || roleRes.message?.toLowerCase().includes("success");

      if (profileOk && roleOk) {
        toast.success("User updated successfully!");
        onSuccess();
        onClose();
      } else if (!profileOk) {
        toast.error(profileRes.message || "Failed to update user profile.");
      } else {
        toast.error(roleRes.message || "Failed to update role.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const passwordMismatch = showPasswordField && form.Password && confirmPassword && form.Password !== confirmPassword;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Edit User</h2>
        {fetching ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            Loading user data...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                <input name="Username" type="text" className={inputClass} value={form.Username} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input name="Email" type="email" className={inputClass} value={form.Email} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input name="FirstName" type="text" className={inputClass} value={form.FirstName} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input name="LastName" type="text" className={inputClass} value={form.LastName} onChange={handleChange} />
              </div>

              {/* Role */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className={inputClass}
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  required
                >
                  <option value="">Select Role</option>
                  {rolesList.map((role: any) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              {!showPasswordField ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordField(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors w-full"
                  >
                    <FiKey size={15} />
                    Change Password
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        name="Password"
                        type={showPassword ? "text" : "password"}
                        className={`${inputClass} pr-10`}
                        value={form.Password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Enter new password"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500" onClick={() => setShowPassword((v) => !v)} role="button">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`${inputClass} pr-10 ${passwordMismatch ? "border-red-500 focus:ring-red-400" : ""}`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500" onClick={() => setShowConfirmPassword((v) => !v)} role="button">
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </span>
                    </div>
                    {passwordMismatch && <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  name="PhoneNumber"
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  value={form.PhoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm((f) => ({ ...f, PhoneNumber: value }));
                  }}
                  maxLength={10}
                  placeholder="10-digit number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="Notes" className={`${inputClass} resize-none`} rows={3} value={form.Notes} onChange={handleChange} />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-60" disabled={loading}>
                {loading ? "Updating..." : "Update User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;
