import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5104/api/';

// Attach token to every axios request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Get roles with permissions
export const getRolesWithPermissions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}UmRolePermission/roles-with-permissions`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};


// Get unassigned users (active)
export const getUnassignedUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}UmUserRole/unassigned/users?isActive=true`);
  return response.data;
};

// Get paged roles (active)
export const getPagedRoles = async (pageNumber = 1, pageSize = 10) => {
  const response = await axios.get(`${API_BASE_URL}UmRole?pageNumber=${pageNumber}&pageSize=${pageSize}&isActive=true`);
  return response.data;
};



// Assign role to user (new API)
export const assignRoleToUser = async (roleId: number, userId: number, assignedBy: number) => {
  const response = await axios.post(`${API_BASE_URL}UmUserRole/assign`, {
    UserId: userId,
    RoleId: roleId,
    AssignedBy: assignedBy
  });
  return response.data;
};

// Edit user-role assignment (PUT)
export const editUserRoleAssignment = async (payload: {
  Id: number;
  UserId: number;
  RoleId: number;
  AssignedBy: number;
  DateAssigned: string;
}) => {
  const response = await axios.put(`${API_BASE_URL}UmUserRole/assignment/by-id/${payload.Id}`, payload);
  return response.data;
};


// Delete user-role assignment by userroleid (Id)
export const deleteUserRoleAssignmentById = async (userroleid: number) => {
  const response = await axios.delete(`${API_BASE_URL}UmUserRole/assignment/by-id/${userroleid}`);
  return response.data;
};

// Create role
export const createRole = async (roleData: {
  RoleName: string;
  PermissionNames: string[];
  Description: string;
  IsSystemRole: boolean;
  CreatedBy: number;
}) => {
  const response = await axios.post(`${API_BASE_URL}UmRole`, roleData);
  return response.data;
};

export interface RegisterUserRequest {
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Password: string;
  ConfirmPassword: string;
  PhoneNumber?: string;
  ProfileImageUrl?: string;
  PreferredLanguage?: string;
  TimeZone?: string;
  TwoFactorEnabled?: boolean;
  Notes?: string;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}






export const registerUser = async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
  const response = await axios.post(`${API_BASE_URL}UmUser/register`, data);
  return response.data;
};

// Get permissions
export const getPermissions = async (pageNumber = 1, pageSize = 100) => {
  const response = await axios.get(`${API_BASE_URL}UmPermission?pageNumber=${pageNumber}&pageSize=${pageSize}&isActive=true`);
  return response.data;
};

// Get user roles (user-role assignments)
export const getUserRoles = async () => {
  const response = await axios.get(`${API_BASE_URL}UmUserRole/user-roles`);
  return response.data;
};

export interface UpdateUserProfileRequest {
  UserId: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Password?: string;
  PhoneNumber?: string;
  Notes?: string;
}

export const updateUserProfile = async (data: UpdateUserProfileRequest) => {
  const response = await axios.put(`${API_BASE_URL}UmUser/profile`, data);
  return response.data;
};

// Get user profile by userId
export const getUserById = async (userId: number) => {
  const response = await axios.get(`${API_BASE_URL}UmUser/${userId}`);
  return response.data;
};
