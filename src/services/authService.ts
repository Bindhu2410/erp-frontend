import api from './api';

// Types for login request and response
export interface LoginRequest {
  EmailOrUsername: string;
  Password: string;
  RememberMe: boolean;
  IpAddress: string;
  DeviceInfo: string;
  UserAgent: string;
  TwoFactorCode: string;
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  dateCreated: string;
  lastLoginDate: string | null;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  preferredLanguage: string;
  timeZone: string;
  twoFactorEnabled: boolean;
  lastPasswordChangeDate: string | null;
  requirePasswordChange: boolean;
  notes: string | null;
}

// Updated types for the actual API response
export interface TokenResponse {
  token: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  userId?: number;
  sessionId?: string | null;
  requiresTwoFactor?: boolean;
  tokenExpiry?: string | null;
  userProfile?: UserProfile;
}

export interface LoginErrorResponse {
  message: string;
}

// Auth service class
export class AuthService {
  /**
   * Login user with email/username and password
   */
  static async login(email: string, password: string, rememberMe: boolean = false): Promise<TokenResponse | LoginResponse> {
    try {
      const loginData: LoginRequest = {
        EmailOrUsername: email,
        Password: password,
        RememberMe: rememberMe,
        IpAddress: "string",
        DeviceInfo: "string",
        UserAgent: "string",
        TwoFactorCode: "string"
      };

      const response = await api.post<TokenResponse | LoginResponse>('UmUser/login', loginData);
      
      // Check if response has token (simple token response)
      if (response.data && 'token' in response.data && response.data.token) {
        // Store the token
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      
      // Handle full LoginResponse format (backward compatibility)
      const fullResponse = response.data as LoginResponse;
      if (fullResponse.success) {
        // Store all authentication data in localStorage
        if (fullResponse.userProfile) {
          localStorage.setItem('userProfile', JSON.stringify(fullResponse.userProfile));
          localStorage.setItem('user', JSON.stringify(fullResponse.userProfile));
        }
        
        if (fullResponse.userId) {
          localStorage.setItem('userId', fullResponse.userId.toString());
        }
        
        if (fullResponse.token) {
          localStorage.setItem('token', fullResponse.token);
          localStorage.setItem('authToken', fullResponse.token);
        }
        
        if (fullResponse.sessionId) {
          localStorage.setItem('sessionId', fullResponse.sessionId);
        }
        
        if (fullResponse.tokenExpiry) {
          localStorage.setItem('tokenExpiry', fullResponse.tokenExpiry);
        }
        
        if (fullResponse.requiresTwoFactor !== undefined) {
          localStorage.setItem('requiresTwoFactor', fullResponse.requiresTwoFactor.toString());
        }
      }
      
      return response.data;
    } catch (error: any) {
      // Handle error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    // Clear all authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('requiresTwoFactor');
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): UserProfile | null {
    const userStr = localStorage.getItem('userProfile') || localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get user's display name (firstName lastName or username)
   */
  static getUserDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    }
    return '';
  }

  /**
   * Get user ID
   */
  static getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  /**
   * Get session ID
   */
  static getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get user's initials for avatar
   */
  static getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return 'GU';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`;
    } else if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.username && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  }
}

export default AuthService;
