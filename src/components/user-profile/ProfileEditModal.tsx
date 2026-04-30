import React, { useState } from "react";
import {
  FiX,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import AuthService from "../../services/authService";
import userService from "../../services/userService";

interface ProfileEditModalProps {
  user: any;
  onClose: () => void;
  onSave: () => void;
}

const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ label, icon, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      <span className="text-orange-400">{icon}</span>
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inputCls = (hasError?: boolean) =>
  `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-300 focus:ring-red-400"
      : "border-gray-200 focus:ring-orange-400 focus:border-orange-400"
  }`;

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    UserId: user?.userId || 0,
    Username: user?.username || "",
    Email: user?.email || "",
    FirstName: user?.firstName || "",
    LastName: user?.lastName || "",
    PhoneNumber: user?.phoneNumber || "",
    ProfileImageUrl: user?.profileImageUrl || "",
    Notes: user?.notes || "",
    Password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.Username.trim()) errs.Username = "Username is required";
    if (!formData.Email.trim()) errs.Email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.Email)) errs.Email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const userId = AuthService.getUserId();
      if (!userId) {
        toast.error("User ID not found");
        return;
      }

      const result = await userService.updateUser({
        ...formData,
        PreferredLanguage: "",
        TimeZone: "",
        TwoFactorEnabled: false,
        ...(formData.Password ? { Password: formData.Password } : {}),
        // If your backend expects teams, add it to UpdateUserRequest type and backend logic
      });

      if (result.success) {
        const updated = {
          ...user,
          username: formData.Username,
          email: formData.Email,
          firstName: formData.FirstName,
          lastName: formData.LastName,
          phoneNumber: formData.PhoneNumber,
          profileImageUrl: formData.ProfileImageUrl,
          notes: formData.Notes        };
        localStorage.setItem("userProfile", JSON.stringify(updated));
        localStorage.setItem("user", JSON.stringify(updated));
        toast.success(result.message);
        onSave();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {AuthService.getUserInitials()}
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Edit Profile
              </h2>
              <p className="text-orange-100 text-xs">{user?.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
          <div className="px-6 py-3 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" icon={<FiUser size={12} />}>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  className={inputCls()}
                  placeholder="First name"
                />
              </Field>
              <Field label="Last Name" icon={<FiUser size={12} />}>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  className={inputCls()}
                  placeholder="Last name"
                />
              </Field>
            </div>

            <Field
              label="Username *"
              icon={<FiUser size={12} />}
              error={errors.Username}
            >
              <input
                type="text"
                name="Username"
                value={formData.Username}
                onChange={handleChange}
                className={inputCls(!!errors.Username)}
              />
            </Field>

            <Field
              label="Email *"
              icon={<FiMail size={12} />}
              error={errors.Email}
            >
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className={inputCls(!!errors.Email)}
              />
            </Field>

            <Field label="Phone Number" icon={<FiPhone size={12} />}>
              <input
                type="tel"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                className={inputCls()}
                placeholder="+91 98765 43210"
              />
            </Field>


            <Field label="New Password" icon={<FiLock size={12} />}>
              <input
                type="password"
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                className={inputCls()}
                placeholder="Leave blank to keep current"
                minLength={6}
              />
            </Field>

            <Field label="Notes" icon={<FiFileText size={12} />}>
              <textarea
                name="Notes"
                value={formData.Notes}
                onChange={handleChange}
                rows={3}
                className={`${inputCls()} resize-none`}
                placeholder="Additional notes..."
              />
            </Field>


          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-3 bg-gray-50 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <FiSave size={15} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
