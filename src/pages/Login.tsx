import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import AuthService from "../services/authService";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setRole } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      const validationError = "Please enter both email/username and password";
      setError(validationError);
      toast.error(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.login(
        formData.email.trim(),
        formData.password,
        formData.rememberMe
      );

      if (response.token) {
        localStorage.setItem("token", response.token);
        // If it's a full response with userProfile, store additional data
        const fullResponse = response as any;
        if (fullResponse.success && fullResponse.userProfile) {
          localStorage.setItem(
            "userProfile",
            JSON.stringify(fullResponse.userProfile)
          );
          localStorage.setItem(
            "user",
            JSON.stringify(fullResponse.userProfile)
          );
          setUser(fullResponse.userProfile); // Update context
          if (fullResponse.roleDto) {
            localStorage.setItem(
              "roleDto",
              JSON.stringify(fullResponse.roleDto)
            );
            setRole(fullResponse.roleDto); // Update context
          }
          if (fullResponse.userId) {
            localStorage.setItem("userId", fullResponse.userId.toString());
          }
          if (fullResponse.sessionId) {
            localStorage.setItem("sessionId", fullResponse.sessionId);
          }
          console.log("Full user profile stored:", fullResponse.userProfile);
        }
        toast.success("Login successful");
        setError("");
        navigate("/Dashboard", { replace: true });
      } else {
        const errorMessage =
          "Invalid credentials. Please check your email/username and password.";
        setError(errorMessage);
        toast.error(errorMessage);
        setFormData((prev) => ({ ...prev, password: "" }));
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Invalid credentials";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage =
            "Invalid credentials. Please check your email/username and password.";
        } else if (error.response.status === 403) {
          errorMessage =
            "Your account has been locked. Please contact administrator.";
        } else if (error.response.status === 404) {
          errorMessage = "User not found. Please check your credentials.";
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage =
          "Unable to connect to server. Please check your internet connection.";
      } else if (error.message) {
        if (error.message.toLowerCase().includes("invalid credential")) {
          errorMessage =
            "Invalid credentials. Please check your email/username and password.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Clear errors when user starts typing
    if (error) {
      setError("");
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleCreateUser = () => {
    navigate("/create-user");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex p-2">
      {/* Left Side - Welcome Section with Login Image */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src="/login_section.png"
            alt="Welcome Back"
            className="w-[600px] h-[600px] object-cover"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* JBS Logo - Top Right */}
          <div className="mb-8 flex justify-start">
            <img
              src="/jbs_logo.png"
              alt="JBS Meditec Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Login Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Login to Your Account
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                      error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                    }`}
                    placeholder="Enter your email or username"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                      error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium bg-transparent border-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Create New User Link */}
              {/* <div className="text-center">
                <button
                  type="button"
                  onClick={handleCreateUser}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium bg-transparent border-none cursor-pointer"
                >
                  Create New User Account
                </button>
              </div> */}
            </form>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500">
              <p className="mb-1">JBS Meditec version 1.00</p>
              <p>
                ©2024 - 2027 all rights reserved{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:text-orange-600 bg-transparent border-none cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
