import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { FiMail, FiRefreshCw, FiTrash2, FiLink, FiDatabase } from "react-icons/fi";

const GmailConfig: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      // Get current user ID (mock for now or from context if available)
      const userId = localStorage.getItem("userId") || "2";
      const response = await api.get(`email/accounts?userId=${userId}`);
      setAccounts(response.data);
    } catch (e) {
      console.error("Error fetching accounts", e);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId") || "2";
      const response = await api.get(`email/auth-url?userId=${userId}`);
      window.location.href = response.data.authorizationUrl;
    } catch (e) {
      toast.error("Failed to get auth URL");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const userId = localStorage.getItem("userId") || "2";
      await api.post(`email/disconnect?userId=${userId}`, {});
      toast.success("Account disconnected");
      fetchAccounts();
    } catch (e) {
      toast.error("Failed to disconnect");
    }
  };

  const handleInitDb = async () => {
    try {
      setLoading(true);
      await api.post("email/init-db", {});
      toast.success("Database initialized successfully");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to initialize database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-4xl mx-auto my-8">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FiMail className="text-orange-500" /> Gmail Configuration
          </h2>
          <p className="text-gray-500 mt-1">Manage your connected Gmail accounts and system settings.</p>
        </div>
        <button
          onClick={handleInitDb}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          title="Setup database tables"
        >
          <FiDatabase /> {loading ? "Initializing..." : "Setup DB"}
        </button>
      </div>

      <div className="space-y-6">
        {accounts.length > 0 ? (
          <div className="border rounded-xl p-6 bg-orange-50 border-orange-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Connected Accounts
            </h3>
            <div className="space-y-4">
              {accounts.map((acc, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      {acc.emailAddress.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{acc.emailAddress}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Connected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Disconnect account"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FiMail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No account connected</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Please connect your Gmail account to send and receive emails directly from the ERP.
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mx-auto font-medium shadow-md"
            >
              <FiLink /> {loading ? "Connecting..." : "Connect Gmail"}
            </button>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
          <h4 className="text-blue-800 font-semibold mb-2">Important Instructions</h4>
          <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
            <li>Ensure the Gmail App credentials (ClientId, ClientSecret) are configured in the backend <code>appsettings.json</code>.</li>
            <li>Add <code>http://localhost:5104/api/email/callback</code> (or your actual redirect URI) to your Google Cloud Project.</li>
            <li>Click "Setup DB" first if you haven't initialized the database tables.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GmailConfig;
