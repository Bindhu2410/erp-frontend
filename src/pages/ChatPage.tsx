import React, { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiPaperclip,
  FiSmile,
  FiPhone,
  FiVideo,
  FiMoreVertical,
} from "react-icons/fi";
import { IoPersonCircle } from "react-icons/io5";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import AuthService from "../services/authService";

// Hide scrollbar while keeping scroll functionality
const scrollbarHideStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
  type: "text" | "image" | "file";
  user: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

const ChatPage: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "groups" | "unread">(
    "all",
  );
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = AuthService.getUserDisplayName() || "Guest User";

  const handleImageError = (contactId: string) => {
    setBrokenImages((prev) => {
      const next = new Set(prev);
      next.add(contactId);
      return next;
    });
  };

  const contacts: Contact[] = [
    {
      id: "1",
      name: "John Doe",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "Hey, how are you?",
      timestamp: "10:30 AM",
      unread: 2,
      online: true,
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "See you tomorrow!",
      timestamp: "9:15 AM",
      unread: 0,
      online: false,
    },
    {
      id: "3",
      name: "Mike Johnson",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "Thanks for the help",
      timestamp: "Yesterday",
      unread: 1,
      online: true,
    },
  ];

  const sampleMessages: Message[] = [
    {
      id: "1",
      text: "Hey there! How are you doing?",
      sender: "other",
      timestamp: new Date(),
      type: "text",
      user: "John Doe",
    },
    {
      id: "2",
      text: "I'm doing great! Thanks for asking. How about you?",
      sender: "me",
      timestamp: new Date(),
      type: "text",
      user: currentUser,
    },
    {
      id: "3",
      text: "Pretty good! Just working on some projects.",
      sender: "other",
      timestamp: new Date(),
      type: "text",
      user: "John Doe",
    },
  ];

  useEffect(() => {
    if (selectedContact) {
      setMessages(sampleMessages);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!selectedContact) return;

    setLoading(true);
    try {
      const payload = {
        Id: Date.now().toString(),
        User: currentUser,
        Message: messageText,
        Timestamp: new Date().toISOString(),
        GroupName: selectedContact.name,
      };

      const response = await fetch("${process.env.REACT_APP_API_BASE_URL}Chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const newMessage: Message = {
            id: result.messageId || Date.now().toString(),
            text: messageText,
            sender: "me",
            timestamp: new Date(),
            type: "text",
            user: currentUser,
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedContact && !loading) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log("File selected:", file.name, file.size, file.type);
      // You can handle file upload here
      // For now, just log the file details
      // Later you can send it to the server or attach to message
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Filtering logic
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "unread") return contact.unread > 0;
    if (activeTab === "groups") return contact.name.includes("Group"); // Simplified group detection

    return true; // 'all' tab
  });

  const unreadCount = contacts.reduce(
    (sum, contact) => sum + contact.unread,
    0,
  );

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="flex h-full bg-white overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Header with Action Buttons */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <div className="flex gap-2">
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="New chat"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Settings"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center bg-gray-100 px-4 py-2.5 rounded-full">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search messages"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-3 w-full bg-transparent placeholder-gray-500 text-gray-900 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-4 pb-0 flex-shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ml-2 ${
                activeTab === "groups"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ml-2 ${
                activeTab === "unread"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              } flex items-center gap-1`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount - 1}
                </span>
              )}
            </button>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-100 ${
                    selectedContact?.id === contact.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {brokenImages.has(contact.id) ? (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <IoPersonCircle className="w-12 h-12 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={() => handleImageError(contact.id)}
                      />
                    )}
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {contact.name}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {contact.timestamp}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600 truncate">
                        {contact.lastMessage}
                      </p>
                      {contact.unread > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-gray-400 text-sm">No chats found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center flex-1">
                  <div className="relative">
                    {brokenImages.has(selectedContact.id) ? (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <IoPersonCircle className="w-10 h-10 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={() => handleImageError(selectedContact.id)}
                      />
                    )}
                    {selectedContact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h2 className="font-semibold text-gray-900 text-sm">
                      {selectedContact.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedContact.online
                        ? "Active now"
                        : "Last seen recently"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <FiPhone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <FiVideo className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2 flex flex-col bg-white min-h-0 hide-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-sm px-4 py-2 rounded-2xl ${
                          msg.sender === "me"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={`text-xs mt-1 opacity-70 ${
                            msg.sender === "me"
                              ? "text-blue-100"
                              : "text-gray-600"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-6 py-3 bg-white border-t border-gray-200 flex-shrink-0 relative">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full right-0 mb-2 z-50 shadow-lg rounded-lg"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      // theme="auto"
                      width={350}
                      height={400}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Aa"
                      className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 relative"
                  >
                    <FiSmile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()}
                    className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <FiSend className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                  Welcome
                </h2>
                <p className="text-gray-400 text-sm">
                  Select a chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
