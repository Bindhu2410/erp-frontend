import { useUser } from "../context/UserContext";

export const useRoleAccess = () => {
  const { user, role } = useUser();

  const isAdmin = () => {
    return role?.roleName === "Administrator";
  };

  const isSalesManager = () => {
    return role?.roleName === "Sales Manager";
  };

  const isMarketingManager = () => {
    return role?.roleName === "Marketing Manager";
  };

  const isManager = () => {
    return isSalesManager() || isMarketingManager() || role?.roleName?.includes("Manager");
  };

  const canViewAllAttendance = () => {
    return isAdmin();
  };

  const canViewTeamAttendance = () => {
    return isManager();
  };

  const canViewOwnAttendance = () => {
    return true; // All users can view their own attendance
  };

  const canManageUsers = () => {
    return isAdmin();
  };

  const canManageTeam = () => {
    return isManager() || isAdmin();
  };

  const getAttendanceScope = () => {
    if (isAdmin()) return "all";
    if (isManager()) return "team";
    return "self";
  };

  return {
    user,
    role,
    isAdmin,
    isSalesManager,
    isMarketingManager,
    isManager,
    canViewAllAttendance,
    canViewTeamAttendance,
    canViewOwnAttendance,
    canManageUsers,
    canManageTeam,
    getAttendanceScope,
  };
};