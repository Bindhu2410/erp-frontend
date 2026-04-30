import React, { useState } from "react";
import EmailSidebar from "./EmailSidebar";
import EmailList from "./EmailList";
import ComposeEmail from "./ComposeEmail";

const EmailLayout: React.FC<{ data?: any[] }> = ({ data }) => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [currentView, setCurrentView] = useState("inbox");
  const leadEmail = data && data[0]?.email;

  return (
    <div className="flex h-screen bg-gray-50">
      <EmailSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onCompose={() => setIsComposeOpen(true)}
      />

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <EmailList view={currentView} />
        </div>
      </div>

      {isComposeOpen && (
        <ComposeEmail
          onClose={() => setIsComposeOpen(false)}
          initialTo={leadEmail}
        />
      )}
    </div>
  );
};

export default EmailLayout;
