// Authentication utility functions

/**
 * Check if user is authenticated by verifying token existence and validity
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token") 
  return !!(token && token.trim() !== '');
};

/**
 * Get the stored authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token")
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("userId");
  localStorage.removeItem("sessionId");
  localStorage.removeItem("tokenExpiry");
  localStorage.removeItem("requiresTwoFactor");
  localStorage.removeItem("user");
};

/**
 * Logout user and redirect to login page
 */
export const logout = (): void => {
  clearAuthData();
  window.location.href = "/login";
};

const authUtils = {
  isAuthenticated,
  getAuthToken,
  clearAuthData,
  logout,
};

export default authUtils;
