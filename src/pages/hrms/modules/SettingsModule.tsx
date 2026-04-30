import React, { useState } from "react";
import {
  Settings, Bell, Lock, Globe, Users, Building2,
  Palette, Mail, Shield, Database, ChevronRight, Check, Save
} from "lucide-react";

const settingsSections = [
  { id: "company", label: "Company Profile", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Access", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "email", label: "Email Configuration", icon: Mail },
  { id: "localization", label: "Localization", icon: Globe },
  { id: "data", label: "Data Management", icon: Database },
];

const SettingsModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState("company");
  const [saved, setSaved] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "JBS Tech Solutions Pvt. Ltd.",
    industry: "Information Technology",
    website: "https://jbstech.com",
    address: "123 Tech Park, Chennai, Tamil Nadu 600001",
    phone: "+91 44 1234 5678",
    email: "hr@jbstech.com",
    currency: "INR",
    timezone: "Asia/Kolkata",
    fiscalYear: "April - March",
  });

  const [notifications, setNotifications] = useState({
    leaveRequests: true,
    timesheetApprovals: true,
    payrollProcessed: true,
    performanceReviews: true,
    assetAssignment: false,
    newEmployee: true,
    reportGenerated: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Configure your HRMS platform preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 h-fit">
          <ul className="space-y-1">
            {settingsSections.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeSection === id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${activeSection === id ? "text-blue-600" : "text-gray-400"}`} />
                    {label}
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeSection === id ? "text-blue-600" : "text-gray-300"}`} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === "company" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-6">Company Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "Company Name", key: "name" },
                  { label: "Industry", key: "industry" },
                  { label: "Website", key: "website" },
                  { label: "Contact Email", key: "email" },
                  { label: "Contact Phone", key: "phone" },
                  { label: "Address", key: "address" },
                  { label: "Currency", key: "currency" },
                  { label: "Timezone", key: "timezone" },
                  { label: "Fiscal Year", key: "fiscalYear" },
                ].map(({ label, key }) => (
                  <div key={key} className={key === "address" ? "md:col-span-2" : ""}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      value={(companyForm as any)[key]}
                      onChange={e => setCompanyForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-6">Notification Preferences</h2>
              <div className="space-y-5">
                {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    leaveRequests: "Leave Requests",
                    timesheetApprovals: "Timesheet Approvals",
                    payrollProcessed: "Payroll Processed",
                    performanceReviews: "Performance Reviews",
                    assetAssignment: "Asset Assignment",
                    newEmployee: "New Employee Onboarding",
                    reportGenerated: "Report Generated",
                  };
                  const descriptions: Record<string, string> = {
                    leaveRequests: "Notify when an employee submits a leave request",
                    timesheetApprovals: "Notify when a new timesheet is submitted for approval",
                    payrollProcessed: "Notify when monthly payroll is processed",
                    performanceReviews: "Notify when performance review cycle starts",
                    assetAssignment: "Notify when an asset is assigned or returned",
                    newEmployee: "Notify when a new employee is onboarded",
                    reportGenerated: "Notify when a new report is generated",
                  };
                  return (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{labels[key]}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{descriptions[key]}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-200"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${value ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-6">Security & Access Control</h2>
              <div className="space-y-4">
                {[
                  { label: "Two-Factor Authentication", desc: "Add an extra layer of security to admin accounts", enabled: true },
                  { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", enabled: true },
                  { label: "IP Whitelist", desc: "Restrict access to specific IP addresses", enabled: false },
                  { label: "Audit Logging", desc: "Track all user actions and system events", enabled: true },
                  { label: "Password Policy", desc: "Enforce strong password requirements", enabled: true },
                ].map(({ label, desc, enabled }, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-sm text-gray-800">{label}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 ml-6">{desc}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeSection === "appearance" || activeSection === "email" || activeSection === "localization" || activeSection === "data") && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">
                {settingsSections.find(s => s.id === activeSection)?.label}
              </h2>
              <div className="text-center py-10 text-gray-400">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-600">Configuration options</p>
                <p className="text-sm">This section is ready for configuration.</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
