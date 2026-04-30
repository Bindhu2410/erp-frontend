import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowLeft, FiPhone, FiImage, FiGlobe, FiClock, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import userService from '../services/userService';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Username: '',
    Email: '',
    FirstName: '',
    LastName: '',
    Password: '',
    ConfirmPassword: '',
    PhoneNumber: '',
    ProfileImageUrl: '',
    PreferredLanguage: 'English',
    TimeZone: 'Asia/Kolkata',
    TwoFactorEnabled: false,
    Notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.Password !== formData.ConfirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.Password.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    setLoading(true);

    try {
      const response = await userService.registerUser(formData);

      if (response.success) {
        toast.success(response.message);
        navigate('/login');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex p-2">
      {/* Left Side - Welcome Section with Login Image */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src="/login_section.png"
            alt="Create New User"
            className="max-w-[600px] w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Right Side - Create User Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Header with Back Button and Logo */}
          <div className="mb-3 flex justify-between items-center">
            <button
              onClick={handleBackToLogin}
              className="flex items-center text-orange-500 hover:text-orange-600 bg-transparent border-none cursor-pointer"
            >
              <FiArrowLeft className="mr-1" size={14} />
              Back to Login
            </button>
            <img
              src="/jbs_logo.png"
              alt="JBS Meditec Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Create User Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Create New User Account</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2.5">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="Username"
                    value={formData.Username}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="user@jbsmeditec.com"
                    required
                  />
                </div>
              </div>

              {/* First Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="FirstName"
                    value={formData.FirstName}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="LastName"
                    value={formData.LastName}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="Password"
                    value={formData.Password}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="ConfirmPassword"
                    value={formData.ConfirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="PhoneNumber"
                    value={formData.PhoneNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Profile Image URL Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiImage className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="ProfileImageUrl"
                    value={formData.ProfileImageUrl}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Preferred Language Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Language
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiGlobe className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="PreferredLanguage"
                    value={formData.PreferredLanguage}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="English"
                  />
                </div>
              </div>

              {/* Timezone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="TimeZone"
                    value={formData.TimeZone}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="Asia/Kolkata"
                  />
                </div>
              </div>

              {/* Two Factor Authentication - Spans both columns */}
              <div className="col-span-2 flex items-center">
                <input
                  type="checkbox"
                  name="TwoFactorEnabled"
                  checked={formData.TwoFactorEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Two Factor Authentication
                </label>
              </div>

              {/* Notes Field - Spans both columns */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FiFileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea
                    name="Notes"
                    value={formData.Notes}
                    onChange={handleInputChange}
                    rows={1}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm"
                    placeholder="Additional notes about the user..."
                  />
                </div>
              </div>

              {/* Create User Button - Spans both columns */}
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mt-2 disabled:bg-orange-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create User Account'}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p className="mb-1">JBS Meditec version 1.00</p>
              <p>
                ©2024 - 2027 all rights reserved{' '}
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

export default CreateUser;
