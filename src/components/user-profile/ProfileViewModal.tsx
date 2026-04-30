import React from "react";
import {
  FiX,
  FiEdit2,
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiClock,
  FiShield,
  FiBriefcase,
} from "react-icons/fi";
import AuthService from "../../services/authService";

interface ProfileViewModalProps {
  user: any;
  onClose: () => void;
  onEdit: () => void;
}

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    <div className="mt-0.5 text-orange-500 flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">
        {value}
      </p>
    </div>
  </div>
);

const ProfileViewModal: React.FC<ProfileViewModalProps> = ({
  user,
  onClose,
  onEdit,
}) => {
  const roleName =
    user?.roleDto?.roleName ||
    JSON.parse(localStorage.getItem("roleDto") || "null")?.roleName ||
    "N/A";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "User";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Banner */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-400 rounded-t-2xl h-16 flex items-center justify-end px-4">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center -mt-8 px-6 pb-1">
          <div className="w-16 h-16 rounded-full bg-orange-500 border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold z-10 relative">
            {AuthService.getUserInitials()}
          </div>
          <h2 className="mt-2 text-base font-bold text-gray-900">{fullName}</h2>
          <span className="mt-1 inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-0.5 rounded-full border border-orange-200">
            <FiBriefcase size={11} />
            {roleName}
          </span>
        </div>

        {/* Info */}
        <div className="px-6 py-1 mt-1">
          <InfoRow
            icon={<FiUser size={15} />}
            label="Username"
            value={user?.username || "N/A"}
          />
          <InfoRow
            icon={<FiMail size={15} />}
            label="Email"
            value={user?.email || "N/A"}
          />
          <div className="flex gap-4">
            <div className="flex-1 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {user?.firstName || "N/A"}
              </p>
            </div>
            <div className="flex-1 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {user?.lastName || "N/A"}
              </p>
            </div>
          </div>
          <InfoRow
            icon={<FiPhone size={15} />}
            label="Phone"
            value={user?.phoneNumber || "N/A"}
          />
          {/* Teams display (if available) */}
          {user?.teams && Array.isArray(user.teams) && user.teams.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Teams</p>
              <ul className="text-sm font-medium text-gray-800 mt-0.5 list-disc list-inside">
                {user.teams.map((team: string, idx: number) => (
                  <li key={idx}>{team}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FiEdit2 size={15} />
            Edit Profile
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewModal;
