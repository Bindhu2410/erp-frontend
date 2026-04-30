import api from './api';

export interface RegisterUserRequest {
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Password: string;
  ConfirmPassword: string;
  PhoneNumber: string;
  ProfileImageUrl: string;
  PreferredLanguage: string;
  TimeZone: string;
  TwoFactorEnabled: boolean;
  Notes: string;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface UpdateUserRequest {
  UserId: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  ProfileImageUrl: string;
  PreferredLanguage: string;
  TimeZone: string;
  TwoFactorEnabled: boolean;
  Notes: string;
  Password?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user?: any;
}

class UserService {
  /**
   * Register a new user
   */
  async registerUser(userData: RegisterUserRequest): Promise<RegisterUserResponse> {
    try {
      const response = await api.post<any>('UmUser/register', userData);
      
      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: response.data?.message || 'User registered successfully',
          userId: response.data?.userId,
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Registration failed',
        };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred during registration',
      };
    }
  }

  /**
   * Delete a user account
   */
  async deleteUser(userId: number): Promise<DeleteUserResponse> {
    try {
      const response = await api.delete<any>(`UmUser/${userId}`);
      
      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: 'Account deleted successfully',
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to delete account',
        };
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      return {
        success: false,
        message: error.message || 'Error occurred while deleting account',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      const response = await api.put<any>('UmUser/profile', userData);
      
      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: response.data?.message || 'Profile updated successfully',
          user: response.data,
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to update profile',
        };
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: error.message || 'Error occurred while updating profile',
      };
    }
  }
}

const userService = new UserService();
export default userService;
