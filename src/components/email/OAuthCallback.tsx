import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        toast.error(`Authentication error: ${error}`);
        navigate("/settings/email");
        return;
      }

      if (!code || !state) {
        toast.error("Invalid callback parameters");
        navigate("/settings/email");
        return;
      }

      try {
        const response = await api.post("email/callback", { code, state });
        if (response.data.success) {
          toast.success("Gmail account connected successfully!");
          // Navigate to wherever the email settings are
          navigate("/settings/email");
        } else {
          toast.error("Failed to connect Gmail account");
          navigate("/settings/email");
        }
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        toast.error(err.response?.data || "Authentication failed");
        navigate("/settings/email");
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">{status}</h2>
        <p className="text-gray-500 mt-2">Please do not close this window.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
