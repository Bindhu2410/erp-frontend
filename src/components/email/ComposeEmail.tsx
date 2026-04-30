import React, { useState, useEffect } from "react";
import { FiX, FiSend, FiPaperclip, FiMoreVertical, FiTrash2, FiAlertCircle, FiCheck } from "react-icons/fi";
import api from "../../services/api";
import { toast } from "react-toastify";

interface ComposeEmailProps {
  onClose: () => void;
  initialTo?: string;
  initialSubject?: string;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ onClose, initialTo = "", initialSubject = "" }) => {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const userId = localStorage.getItem("userId") || "2";
        const response = await api.get(`email/accounts?userId=${userId}`);
        setIsConnected(response.data.length > 0);
      } catch (e) {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleSendViaGmail = () => {
    if (!to) {
      toast.error("Please specify at least one recipient.");
      return;
    }
    
    // mirroring PurchaseOrderViewPage.tsx logic
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank");
    toast.info("Opening Gmail...");
    onClose();
  };

  const handleSend = async () => {
    if (!to) {
      toast.error("Please specify at least one recipient.");
      return;
    }

    try {
      setIsSending(true);
      const userId = localStorage.getItem("userId") || "2";
      
      const payload = {
        to,
        subject,
        bodyHtml: body.replace(/\n/g, "<br>"),
        bodyText: body,
        attachments: []
      };

      const response = await api.post(`email/send?userId=${userId}`, payload);
      
      if (response.data.success) {
        toast.success("Email sent successfully!");
        onClose();
      } else {
        toast.error(response.data.errorMessage || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.response?.data?.errorMessage || "An error occurred while sending the email.");
    } finally {
      setIsSending(false);
    }
  };

  if (isConnected === false) {
    return (
      <div className="fixed bottom-0 right-8 w-[500px] bg-white rounded-t-xl shadow-2xl border border-gray-200 flex flex-col z-[60]">
        <div className="bg-gray-800 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
          <span className="font-medium text-sm">Compose Email</span>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="p-8 text-center flex flex-col items-center gap-4">
          <div className="p-4 bg-orange-100 rounded-full text-orange-600">
            <FiAlertCircle className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Gmail Not Connected</h3>
          <p className="text-sm text-gray-500">
            You need to connect your Gmail account in settings before you can send emails.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.href = "/settings/email"}
              className="px-6 py-2 bg-white border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
            >
              Go to Settings
            </button>
            <button 
              onClick={handleSendViaGmail}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Send via Gmail
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-8 w-[600px] bg-white rounded-t-xl shadow-2xl border border-gray-200 flex flex-col z-[60] animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 rounded-t-xl flex items-center justify-between">
        <span className="font-medium text-sm">New Message</span>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col flex-1">
        <div className="border-b px-4 py-2 flex items-center gap-2">
          <span className="text-gray-500 text-sm w-12">To</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 outline-none text-sm py-1"
            placeholder="Recipients"
          />
        </div>
        <div className="border-b px-4 py-2">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full outline-none text-sm font-medium py-1"
            placeholder="Subject"
          />
        </div>

        {/* Text Area */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 p-4 min-h-[300px] outline-none text-sm resize-none leading-relaxed"
          placeholder="Compose your message..."
        />
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t flex items-center justify-between bg-gray-50 rounded-b-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={isSending || isConnected === null}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-md ${
              isSending ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            <FiSend className={isSending ? "animate-pulse" : ""} />
            {isSending ? "Send" : "Send"}
          </button>

          <button
            onClick={handleSendViaGmail}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <FiCheck className="text-green-500" />
            Send via Gmail
          </button>
          
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
            <FiPaperclip className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
            <FiMoreVertical />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
