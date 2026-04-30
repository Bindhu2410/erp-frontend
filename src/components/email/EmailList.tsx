import React, { useState } from "react";
import { MdStar, MdStarBorder, MdLabel } from "react-icons/md";

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isStarred: boolean;
  isRead: boolean;
  labels: string[];
}

interface EmailListProps {
  view: string;
}

const EmailList: React.FC<EmailListProps> = ({ view }) => {
  // Mock data - replace with actual API call
  const [emails, setEmails] = useState<Email[]>([
    {
      id: "1",
      from: "John Doe",
      subject: "Project Update",
      preview: "Here are the latest updates for the project...",
      date: "10:30 AM",
      isStarred: true,
      isRead: false,
      labels: ["work", "important"],
    },
    // Add more mock emails as needed
  ]);

  const toggleStar = (id: string) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, isStarred: !email.isStarred } : email
      )
    );
  };

  const getEmails = () => {
    // Filter emails based on current view
    switch (view) {
      case "inbox":
        return emails;
      case "starred":
        return emails.filter((email) => email.isStarred);
      case "sent":
        // Implement sent emails logic
        return [];
      case "drafts":
        // Implement drafts logic
        return [];
      default:
        return emails;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {getEmails().map((email) => (
        <div
          key={email.id}
          className={`flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer ${
            !email.isRead ? "bg-blue-50" : ""
          }`}
        >
          <button
            onClick={() => toggleStar(email.id)}
            className="mr-4 text-gray-400 hover:text-yellow-400"
          >
            {email.isStarred ? (
              <MdStar className="text-yellow-400" size={20} />
            ) : (
              <MdStarBorder size={20} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <span
                className={`font-medium ${!email.isRead ? "font-bold" : ""}`}
              >
                {email.from}
              </span>
              <span className="ml-auto text-sm text-gray-500">
                {email.date}
              </span>
            </div>

            <div className="flex items-center">
              <span
                className={`text-gray-900 ${
                  !email.isRead ? "font-semibold" : ""
                }`}
              >
                {email.subject}
              </span>
              <div className="flex gap-1 ml-2">
                {email.labels.map((label) => (
                  <span
                    key={label}
                    className="flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    <MdLabel className="mr-1" size={12} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-gray-500 truncate">{email.preview}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailList;
