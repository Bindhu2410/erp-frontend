import React, { useState, useEffect, useCallback, useMemo } from "react";
import teamHierarchyService from "../../services/teamHierarchyService";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiUsers,
  FiFilter,
} from "react-icons/fi";
import { TeamHierarchyCharts } from "../../components/user-management";
import { getUserRoles } from "../../services/user.service";
import "animate.css";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  avatar: string;
  email: string;
  subordinates?: number;
}

// Define proper types for role colors
type RoleType =
  | "Admin"
  | "Managing Director"
  | "Area Manager";

const TeamHierarchy: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [apiHierarchy, setApiHierarchy] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("All");

  const ROLES = [
    "All",
    "Managing Director",
    "Admin",
    "Area Manager",
  ];

  const roleColors: Record<string, string> = {
    "Managing Director": "#2F4B7C",
    Admin: "#B279A2",
    "Area Manager": "#E45756",
  };

  const filteredHierarchy = useMemo(() => {
    if (selectedRole === "All") return apiHierarchy;
    // Keep the selected role's users + their parents so the tree still connects
    const matchingUserIds = new Set(
      apiHierarchy
        .filter((item) => item.roleName === selectedRole)
        .map((item) => item.userId)
    );
    return apiHierarchy.filter(
      (item) =>
        item.roleName === selectedRole ||
        matchingUserIds.has(item.parentUserId)
    );
  }, [apiHierarchy, selectedRole]);

  const [newTeam, setNewTeam] = useState({
    regionName: "",
    parentUserId: "",
    userId: "",
    role: "",
  });

  /* ---------------- FETCH DATA ---------------- */

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const response = await teamHierarchyService.getHierarchy();
      const json = response.data;
      if (json.status && Array.isArray(json.data)) {
        setApiHierarchy(json.data);
      } else {
        toast.error(json.message || "Failed to fetch hierarchy");
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching hierarchy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRolesData = async () => {
      try {
        const json = await getUserRoles();
        if (json.status && Array.isArray(json.data)) {
          setUserRoles(json.data);
        } else {
          toast.error(json.message || "Failed to fetch user roles");
        }
      } catch (err: any) {
        toast.error(err.message || "Error fetching user roles");
      }
    };

    fetchHierarchy();
    fetchUserRolesData();
  }, []);

  /* ---------------- BUILD TREE ---------------- */

  /* ---------------- ADD TEAM ---------------- */

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedUser = userRoles.find(
        (u) => String(u.userId) === newTeam.userId,
      );

      const payload = {
        UserId: Number(newTeam.userId),
        ParentUserId: newTeam.parentUserId ? Number(newTeam.parentUserId) : 0,
        RoleId: selectedUser?.roleId || 0,
        Region: newTeam.regionName,
        AssignedBy: 1, // Using default admin ID as placeholder
      };

      const response = await teamHierarchyService.addOrUpdateTeam(payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Team member added successfully!");
        setShowAddModal(false);
        setNewTeam({ regionName: "", parentUserId: "", userId: "", role: "" });
        await fetchHierarchy();
      } else {
        toast.error(response.data?.message || "Failed to save team member");
      }
    } catch (error: any) {
      toast.error(error.message || "Error saving team member");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Team Hierarchy
          </h2>
          {/* <p className="text-sm sm:text-base text-gray-600">
            Manage your organizational structure and reporting relationships
          </p> */}
        </div>

        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <FiFilter size={15} className="text-gray-500" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <FiPlus size={18} />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="animate__animated animate__fadeInUp">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredHierarchy.length > 0 ? (
          <TeamHierarchyCharts
            hierarchyData={filteredHierarchy.map((item) => ({
              id: String(item.userId),
              parentId: item.parentUserId
                ? String(item.parentUserId)
                : undefined,
              name: item.username,
              role: item.roleName,
              team: item.region,
              avatar: "",
              email: "",
            }))}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-gray-400 mb-4">
              <FiUsers size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No team members found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first team member
            </p>
            {/* <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <FiPlus size={18} />
              Add Team Member
            </button> */}
          </div>
        )}
      </div>

      {/* Modal - Responsive Design */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="
              animate__animated 
              animate__zoomIn 
              bg-white 
              rounded-2xl 
              shadow-2xl 
              w-full 
              max-w-lg 
              p-6 sm:p-8
              max-h-[90vh]
              overflow-y-auto
            "
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Add Team Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTeam} className="space-y-5">
              {/* User */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parent User
                </label>
                <select
                  value={newTeam.parentUserId}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, parentUserId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Parent</option>
                  {userRoles.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.username} - {user.roleName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Name
                </label>
                <select
                  value={newTeam.userId}
                  onChange={(e) => {
                    const selectedUser = userRoles.find(
                      (u) => String(u.userId) === e.target.value,
                    );
                    setNewTeam({
                      ...newTeam,
                      userId: e.target.value,
                      role: selectedUser?.roleName || "",
                    });
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select User</option>
                  {userRoles.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.username} - {user.roleName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent */}

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newTeam.role}
                  disabled
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-100 text-gray-600"
                />
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Region Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. North India"
                  value={newTeam.regionName}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, regionName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition shadow-md hover:shadow-lg order-1 sm:order-2"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamHierarchy;
