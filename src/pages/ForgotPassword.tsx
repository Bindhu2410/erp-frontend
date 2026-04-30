import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle forgot password logic here
    console.log('Forgot password submitted for:', email);
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    // Handle resend email logic
    console.log('Resending email to:', email);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex p-2">
      {/* Left Side - Welcome Section with Login Image */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src="/login_section.png" 
            alt="Reset Password" 
            className="w-[600px] h-[600px] object-cover"
          />
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* JBS Logo - Top */}
          <div className="mb-8 flex justify-start">
            <img 
              src="/jbs_logo.png" 
              alt="JBS Meditec Logo" 
              className="h-10 w-auto"
            />
          </div>

          {/* Back to Login */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center text-orange-500 hover:text-orange-600 mb-6 bg-transparent border-none cursor-pointer"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Back to Login
          </button>

          {/* Forgot Password Content */}
          <div>
            {!isSubmitted ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Your Password</h2>
                <p className="text-gray-600 mb-8">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  {/* Send Reset Link Button */}
                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Send Reset Link
                  </button>
                </form>
              </>
            ) : (
              /* Success Message */
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
                <p className="text-gray-600 mb-8">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Resend Email
                  </button>

                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}

            {/* Additional Help */}
            {!isSubmitted && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700">
                  If you don't have access to your email or continue having issues, 
                  please contact your system administrator for assistance.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500">
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

export default ForgotPassword;
