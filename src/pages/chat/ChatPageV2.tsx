import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiSend,
  FiPaperclip,
  FiSmile,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiSearch,
  FiUsers,
  FiPlus,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiCornerUpLeft,
  FiImage,
  FiFile,
  FiMoon,
  FiSun,
  FiBellOff,
  FiBell,
  FiArrowLeft,
} from "react-icons/fi";
import { IoPersonCircle } from "react-icons/io5";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import "./WhatsAppChat.css";
import chatApi from "../../services/chatService";
import { useChatHub } from "../../hooks/useChatHub";
import type {
  ChatListItem,
  ChatMessage,
  ChatMember,
  ChatUser,
  SignalRMessage,
  TypingIndicator,
  PresenceUpdate,
  ReadReceipt,
} from "../../types/chat";

// Hide scrollbar
const scrollbarHideStyles = `
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
`;

const ChatPageV2: React.FC = () => {
  // State
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "groups" | "unread">("all");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [chatMembers, setChatMembers] = useState<ChatMember[]>([]);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [messageContextMenu, setMessageContextMenu] = useState<{ msg: ChatMessage; x: number; y: number } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<number[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Current user
  const currentUserId = (() => {
    try {
      const storedId = localStorage.getItem("userId");
      if (storedId) return parseInt(storedId, 10) || 0;
      const user = JSON.parse(localStorage.getItem("user") || localStorage.getItem("userProfile") || "{}");
      return user.userId || 0;
    } catch { return 0; }
  })();

  const currentUserName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || localStorage.getItem("userProfile") || "{}");
      return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Guest";
    } catch { return "Guest"; }
  })();

  // SignalR Hub
  const { isConnected, sendMessage: hubSendMessage, sendTyping, markAsRead, joinChat } = useChatHub({
    onReceiveMessage: (msg: SignalRMessage) => {
      const newMsg: ChatMessage = {
        ...msg,
        isEdited: false,
        isDeleted: false,
        readByCount: 0,
        totalRecipients: 0,
      };
      setMessages((prev) => {
        if (prev.some((m) => m.messageId === newMsg.messageId)) return prev;
        return [...prev, newMsg];
      });
      // Update chat list
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === msg.chatId
            ? {
                ...c,
                lastMessage: msg.messageText || (msg.messageType !== "text" ? `[${msg.messageType}]` : ""),
                lastMessageTime: msg.dateCreated,
                lastMessageSender: msg.senderName,
                lastMessageType: msg.messageType,
                unreadCount: msg.senderId !== currentUserId ? c.unreadCount + 1 : c.unreadCount,
              }
            : c
        ).sort((a, b) => {
          const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return tb - ta;
        })
      );
    },
    onUserTyping: (data: TypingIndicator) => {
      if (data.userId === currentUserId) return;
      const key = `${data.chatId}_${data.userId}`;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(key, data);
        } else {
          next.delete(key);
        }
        return next;
      });
    },
    onUserOnline: (data: PresenceUpdate) => {
      setOnlineUsers((prev) => {
        const next = new Set(Array.from(prev));
        next.add(data.userId);
        return next;
      });
      setChats((prev) =>
        prev.map((c) =>
          c.otherUserId === data.userId ? { ...c, otherUserOnline: true } : c
        )
      );
    },
    onUserOffline: (data: PresenceUpdate) => {
      setOnlineUsers((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(data.userId);
        return next;
      });
      setChats((prev) =>
        prev.map((c) =>
          c.otherUserId === data.userId ? { ...c, otherUserOnline: false } : c
        )
      );
    },
    onMessagesRead: (data: ReadReceipt) => {
      if (data.userId === currentUserId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.chatId === data.chatId ? { ...m, readByCount: m.readByCount + 1 } : m
        )
      );
    },
    onMessageEdited: (msg: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.messageId === msg.messageId ? { ...m, ...msg } : m))
      );
    },
    onChatCreated: () => {
      loadChats();
    },
  });

  // Load chats
  const loadChats = useCallback(async () => {
    try {
      const data = await chatApi.getChats();
      setChats(data);
      const onlineSet = new Set<number>();
      data.forEach((c) => {
        if (c.otherUserOnline && c.otherUserId) onlineSet.add(c.otherUserId);
      });
      setOnlineUsers(onlineSet);
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  }, []);

  // Load messages for selected chat
  const loadMessages = useCallback(
    async (chatId: number, pageNum: number = 1) => {
      setMessagesLoading(true);
      try {
        const data = await chatApi.getChatHistory(chatId, pageNum, 50);
        if (pageNum === 1) {
          setMessages(data.reverse());
        } else {
          setMessages((prev) => [...data.reverse(), ...prev]);
        }
        setHasMore(data.length === 50);
        setPage(pageNum);
        // Mark as read
        await chatApi.markAsRead(chatId);
        markAsRead(chatId);
        // Update unread count
        setChats((prev) =>
          prev.map((c) => (c.chatId === chatId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    },
    [markAsRead]
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.chatId);
      joinChat(selectedChat.chatId);
    }
  }, [selectedChat, loadMessages, joinChat]);

  useEffect(() => {
    if (!messagesLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messagesLoading]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojiPicker]);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setMessageContextMenu(null);
    if (messageContextMenu) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [messageContextMenu]);

  // Typing handler
  const handleTyping = useCallback(() => {
    if (!selectedChat) return;
    sendTyping(selectedChat.chatId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedChat) sendTyping(selectedChat.chatId, false);
    }, 2000);
  }, [selectedChat, sendTyping]);

  // Send message
  const handleSendMessage = async () => {
    if (!selectedChat || (!message.trim() && !editingMessage)) return;

    if (editingMessage) {
      try {
        await chatApi.editMessage(editingMessage.messageId, message);
        setMessages((prev) =>
          prev.map((m) =>
            m.messageId === editingMessage.messageId
              ? { ...m, messageText: message, isEdited: true }
              : m
          )
        );
        setEditingMessage(null);
      } catch (err) {
        console.error("Failed to edit:", err);
      }
      setMessage("");
      return;
    }

    const text = message;
    setMessage("");
    setReplyTo(null);

    try {
      await hubSendMessage({
        chatId: selectedChat.chatId,
        messageText: text,
        messageType: "text",
        replyToId: replyTo?.messageId,
      });
    } catch {
      // Fallback to REST
      try {
        await chatApi.sendMessage({
          chatId: selectedChat.chatId,
          messageText: text,
          messageType: "text",
          replyToId: replyTo?.messageId,
        });
      } catch (err) {
        console.error("Failed to send:", err);
      }
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(selectedChat.chatId, false);
  };

  // File upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    setLoading(true);
    try {
      const result = await chatApi.uploadFile(file);
      await hubSendMessage({
        chatId: selectedChat.chatId,
        messageText: file.name,
        messageType: result.messageType,
        fileUrl: result.fileUrl,
        fileName: result.fileName,
        fileSize: result.fileSize,
      });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create private chat
  const handleCreatePrivateChat = async (userId: number) => {
    try {
      const { chatId } = await chatApi.createPrivateChat(userId);
      await loadChats();
      const chat = chats.find((c) => c.chatId === chatId);
      if (chat) setSelectedChat(chat);
      setShowNewChatModal(false);
      // Reload to get the new chat
      const updatedChats = await chatApi.getChats();
      setChats(updatedChats);
      const newChat = updatedChats.find((c) => c.chatId === chatId);
      if (newChat) setSelectedChat(newChat);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  // Create group chat
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;
    try {
      const { chatId } = await chatApi.createGroupChat(groupName, selectedGroupMembers);
      await loadChats();
      const updatedChats = await chatApi.getChats();
      setChats(updatedChats);
      const newChat = updatedChats.find((c) => c.chatId === chatId);
      if (newChat) setSelectedChat(newChat);
      setShowGroupModal(false);
      setGroupName("");
      setSelectedGroupMembers([]);
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  // Load available users
  const loadAvailableUsers = async () => {
    try {
      const users = await chatApi.getAvailableUsers();
      setAvailableUsers(users);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  // Load chat members
  const loadChatMembers = async (chatId: number) => {
    try {
      const members = await chatApi.getChatMembers(chatId);
      setChatMembers(members);
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: number) => {
    try {
      await chatApi.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId ? { ...m, isDeleted: true, messageText: "[Message deleted]" } : m
        )
      );
    } catch (err) {
      console.error("Failed to delete:", err);
    }
    setMessageContextMenu(null);
  };

  // Load more on scroll top
  const handleMessagesScroll = () => {
    if (!messagesContainerRef.current || messagesLoading || !hasMore || !selectedChat) return;
    if (messagesContainerRef.current.scrollTop < 100) {
      loadMessages(selectedChat.chatId, page + 1);
    }
  };

  // Filtered chats
  const filteredChats = chats.filter((c) => {
    const name = (c.chatType === "private" ? c.otherUserName : c.chatName) || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.lastMessage || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "unread") return c.unreadCount > 0;
    if (activeTab === "groups") return c.chatType === "group";
    return true;
  });

  const unreadTotal = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  // Typing indicator text
  const getTypingText = () => {
    if (!selectedChat) return null;
    const typers = Array.from(typingUsers.values()).filter(
      (t) => t.chatId === selectedChat.chatId
    );
    if (typers.length === 0) return null;
    if (typers.length === 1) return `${typers[0].userName} is typing...`;
    return `${typers.length} people are typing...`;
  };

  // Format time
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 7 * 86400000) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Format message time
  const formatMsgTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Dynamic theme classes
  const bg = darkMode ? "bg-gray-900" : "bg-white";
  const bgSecondary = darkMode ? "bg-gray-800" : "bg-gray-50";
  const text = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";
  const hover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const inputBg = darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900";

  // Chat display name
  const getChatName = (chat: ChatListItem) =>
    chat.chatType === "private" ? chat.otherUserName || "User" : chat.chatName || "Group";

  const getChatOnline = (chat: ChatListItem) =>
    chat.chatType === "private" ? chat.otherUserOnline || onlineUsers.has(chat.otherUserId || 0) : false;

  // Avatar component
  const Avatar: React.FC<{ name: string; src?: string | null; size?: string; online?: boolean }> = ({
    name,
    src,
    size = "w-12 h-12",
    online,
  }) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500", "bg-indigo-500"];
    const color = colors[name.charCodeAt(0) % colors.length];

    return (
      <div className="relative flex-shrink-0">
        {src ? (
          <img src={src} alt={name} className={`${size} rounded-full object-cover`} />
        ) : (
          <div className={`${size} rounded-full ${color} flex items-center justify-center text-white font-semibold text-sm`}>
            {initials || <IoPersonCircle className={size} />}
          </div>
        )}
        {online && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
    );
  };

  // Read receipt indicator
  const ReadReceipt: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    if (msg.senderId !== currentUserId) return null;
    if (msg.readByCount > 0 && msg.readByCount >= msg.totalRecipients) {
      return <FiCheckCircle className="w-3.5 h-3.5 text-blue-400 inline ml-1" />;
    }
    if (msg.readByCount > 0) {
      return <FiCheck className="w-3.5 h-3.5 text-blue-400 inline ml-1" />;
    }
    return <FiCheck className="w-3.5 h-3.5 text-gray-400 inline ml-1" />;
  };

  // Render file message
  const renderFileContent = (msg: ChatMessage) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:5104";
    if (msg.messageType === "image") {
      return (
        <img
          src={`${baseUrl}${msg.fileUrl}`}
          alt={msg.fileName || "Image"}
          className="max-w-xs rounded-lg cursor-pointer"
          onClick={() => window.open(`${baseUrl}${msg.fileUrl}`, "_blank")}
        />
      );
    }
    return (
      <a
        href={`${baseUrl}${msg.fileUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 rounded-lg bg-white bg-opacity-20"
      >
        <FiFile className="w-8 h-8" />
        <div className="text-sm">
          <p className="font-medium truncate max-w-[200px]">{msg.fileName}</p>
          {msg.fileSize && <p className="text-xs opacity-70">{(msg.fileSize / 1024).toFixed(1)} KB</p>}
        </div>
      </a>
    );
  };

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className={`flex h-full ${bg} overflow-hidden transition-colors duration-200`}>
        {/* ===== SIDEBAR ===== */}
        <div
          className={`${
            showMobileChat ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 ${bg} border-r ${border} flex-col overflow-hidden flex-shrink-0`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${border} flex-shrink-0`}>
            <div className="flex items-center justify-between mb-3">
              <h1 className={`text-2xl font-bold ${text}`}>Messages</h1>
              <div className="flex gap-1">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 ${textSecondary} ${hover} rounded-full transition-colors`}
                  title={darkMode ? "Light mode" : "Dark mode"}
                >
                  {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    loadAvailableUsers();
                    setShowGroupModal(true);
                  }}
                  className={`p-2 ${textSecondary} ${hover} rounded-full transition-colors`}
                  title="New group"
                >
                  <FiUsers className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    loadAvailableUsers();
                    setShowNewChatModal(true);
                  }}
                  className={`p-2 ${textSecondary} ${hover} rounded-full transition-colors`}
                  title="New chat"
                >
                  <FiPlus className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Search */}
            <div className={`flex items-center ${inputBg} px-4 py-2.5 rounded-full`}>
              <FiSearch className={`w-4 h-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder="Search messages"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`ml-3 w-full bg-transparent placeholder-gray-500 ${text} focus:outline-none text-sm`}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${border} px-4 flex-shrink-0`}>
            {(["all", "groups", "unread"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab !== "all" ? "ml-2" : ""
                } ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : `border-transparent ${textSecondary} hover:text-gray-900`
                } flex items-center gap-1`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "unread" && unreadTotal > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadTotal}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {!isConnected && (
              <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs text-center">
                Reconnecting...
              </div>
            )}
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowMobileChat(true);
                  }}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 border-b ${border} ${
                    selectedChat?.chatId === chat.chatId
                      ? darkMode
                        ? "bg-gray-700"
                        : "bg-blue-50"
                      : hover
                  }`}
                >
                  <Avatar
                    name={getChatName(chat)}
                    src={chat.chatType === "private" ? chat.otherUserAvatar : chat.chatImageUrl}
                    online={getChatOnline(chat)}
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-semibold ${text} text-sm truncate`}>{getChatName(chat)}</h3>
                      <span className={`text-xs ${textSecondary} ml-2 flex-shrink-0`}>
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm ${textSecondary} truncate`}>
                        {chat.chatType === "group" && chat.lastMessageSender && (
                          <span className="font-medium">{chat.lastMessageSender.split(" ")[0]}: </span>
                        )}
                        {chat.lastMessage || "No messages yet"}
                      </p>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {chat.isMuted && <FiBellOff className="w-3.5 h-3.5 text-gray-400" />}
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FiSearch className={`w-12 h-12 ${textSecondary} mx-auto mb-3 opacity-30`} />
                <p className={`${textSecondary} text-sm`}>
                  {chats.length === 0 ? "No chats yet. Start a new conversation!" : "No chats found"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== CHAT AREA ===== */}
        <div
          className={`${
            showMobileChat ? "flex" : "hidden md:flex"
          } flex-1 flex-col ${bg} overflow-hidden`}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={`px-4 md:px-6 py-3 ${bg} border-b ${border} flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center flex-1 min-w-0">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className={`md:hidden p-2 mr-2 ${textSecondary} ${hover} rounded-full`}
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    name={getChatName(selectedChat)}
                    src={selectedChat.chatType === "private" ? selectedChat.otherUserAvatar : selectedChat.chatImageUrl}
                    size="w-10 h-10"
                    online={getChatOnline(selectedChat)}
                  />
                  <div className="ml-3 min-w-0">
                    <h2 className={`font-semibold ${text} text-sm truncate`}>{getChatName(selectedChat)}</h2>
                    <p className={`text-xs ${textSecondary} mt-0.5`}>
                      {getTypingText() || (
                        getChatOnline(selectedChat)
                          ? "Active now"
                          : selectedChat.chatType === "group"
                          ? `${selectedChat.memberCount} members`
                          : "Last seen recently"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {selectedChat.chatType === "group" && (
                    <button
                      onClick={() => {
                        loadChatMembers(selectedChat.chatId);
                        setShowMembersPanel(!showMembersPanel);
                      }}
                      className={`p-2 ${textSecondary} ${hover} rounded-full transition-colors`}
                    >
                      <FiUsers className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await chatApi.toggleMute(selectedChat.chatId);
                      setChats((prev) =>
                        prev.map((c) =>
                          c.chatId === selectedChat.chatId ? { ...c, isMuted: !c.isMuted } : c
                        )
                      );
                      setSelectedChat((prev) => prev ? { ...prev, isMuted: !prev.isMuted } : null);
                    }}
                    className={`p-2 ${textSecondary} ${hover} rounded-full transition-colors`}
                  >
                    {selectedChat.isMuted ? <FiBellOff className="w-5 h-5" /> : <FiBell className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className={`flex-1 overflow-y-auto px-4 md:px-6 py-3 space-y-4 flex flex-col ${
                  darkMode ? "whatsapp-bg-dark dark" : "whatsapp-bg"
                } min-h-0 hide-scrollbar`}
              >
                {messagesLoading && page === 1 && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                  </div>
                )}
                {messages.length === 0 && !messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className={`${textSecondary} text-sm`}>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUserId;
                    const showSender =
                      selectedChat.chatType === "group" &&
                      !isMe &&
                      (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

                    return (
                      <div key={msg.messageId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-xs md:max-w-sm lg:max-w-md relative group">
                          {showSender && (
                            <p className="text-xs font-medium text-blue-500 mb-1 ml-1">{msg.senderName}</p>
                          )}
                          {/* Reply preview */}
                          {msg.replyToId && msg.replyText && (
                            <div
                              className={`text-xs px-3 py-1.5 rounded-t-lg border-l-2 border-blue-400 ${
                                isMe ? "bg-blue-400 bg-opacity-30" : darkMode ? "bg-gray-600" : "bg-gray-200"
                              }`}
                            >
                              <span className="font-medium">{msg.replySenderName}</span>
                              <p className="truncate opacity-80">{msg.replyText}</p>
                            </div>
                          )}
                          <div
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setMessageContextMenu({ msg, x: e.clientX, y: e.clientY });
                            }}
                            className={`px-3 py-1.5 relative ${
                              msg.replyToId ? "rounded-b-lg" : "rounded-lg"
                            } ${
                              isMe ? "bubble-outgoing self-end" : "bubble-incoming self-start"
                            }`}
                          >
                            {msg.messageType === "system" ? (
                              <p className="text-xs text-center italic opacity-70">{msg.messageText}</p>
                            ) : msg.messageType !== "text" && msg.fileUrl ? (
                              renderFileContent(msg)
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.messageText}</p>
                            )}
                            <div className={`flex items-center justify-end gap-1 mt-1`}>
                              <span className={`text-xs opacity-60`}>{formatMsgTime(msg.dateCreated)}</span>
                              {msg.isEdited && <span className="text-xs opacity-50 italic">edited</span>}
                              <ReadReceipt msg={msg} />
                            </div>
                          </div>
                          {/* Hover actions */}
                          <div
                            className={`absolute top-0 ${
                              isMe ? "-left-20" : "-right-20"
                            } hidden group-hover:flex items-center gap-1`}
                          >
                            <button
                              onClick={() => {
                                setReplyTo(msg);
                              }}
                              className={`p-1 ${textSecondary} hover:text-blue-500 rounded`}
                            >
                              <FiCornerUpLeft className="w-4 h-4" />
                            </button>
                            {isMe && !msg.isDeleted && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingMessage(msg);
                                    setMessage(msg.messageText || "");
                                  }}
                                  className={`p-1 ${textSecondary} hover:text-green-500 rounded`}
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.messageId)}
                                  className={`p-1 ${textSecondary} hover:text-red-500 rounded`}
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Typing indicator */}
                {getTypingText() && (
                  <div className="flex justify-start">
                    <div className={`px-4 py-2 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-white shadow-sm"} rounded-bl-none`}>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply / Edit bar */}
              {(replyTo || editingMessage) && (
                <div className={`px-6 py-2 ${bg} border-t ${border} flex items-center gap-2`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-500">
                      {editingMessage ? "Editing" : `Reply to ${replyTo?.senderName}`}
                    </p>
                    <p className={`text-xs ${textSecondary} truncate`}>
                      {editingMessage ? editingMessage.messageText : replyTo?.messageText}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setEditingMessage(null);
                      setMessage("");
                    }}
                    className={`p-1 ${textSecondary} hover:text-red-500`}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Input */}
              <div className={`px-4 md:px-6 py-3 ${bg} border-t ${border} flex-shrink-0 relative`}>
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50 shadow-lg rounded-lg">
                    <EmojiPicker
                      onEmojiClick={(data: EmojiClickData) => {
                        setMessage((prev) => prev + data.emoji);
                        setShowEmojiPicker(false);
                      }}
                      width={350}
                      height={400}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 ${textSecondary} ${hover} rounded-full transition-colors flex-shrink-0`}
                  >
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className={`w-full px-4 py-2.5 ${inputBg} border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2.5 ${textSecondary} ${hover} rounded-full transition-colors flex-shrink-0`}
                  >
                    <FiSmile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()}
                    className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <FiSend className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center ${bg}`}>
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSend className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className={`text-2xl font-semibold ${textSecondary} mb-2`}>Welcome to Chat</h2>
                <p className={`${textSecondary} text-sm`}>Select a chat or start a new conversation</p>
              </div>
            </div>
          )}
        </div>

        {/* ===== MEMBERS PANEL ===== */}
        {showMembersPanel && selectedChat?.chatType === "group" && (
          <div className={`w-72 ${bg} border-l ${border} flex-shrink-0 flex flex-col`}>
            <div className={`p-4 border-b ${border} flex items-center justify-between`}>
              <h3 className={`font-semibold ${text}`}>Members ({chatMembers.length})</h3>
              <button onClick={() => setShowMembersPanel(false)} className={textSecondary}>
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatMembers.map((m) => (
                <div key={m.userId} className={`flex items-center px-4 py-3 ${hover}`}>
                  <Avatar name={m.userName} src={m.avatar} size="w-9 h-9" online={m.isOnline} />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className={`text-sm font-medium ${text} truncate`}>{m.userName}</p>
                    <p className={`text-xs ${textSecondary}`}>
                      {m.role === "admin" ? "Admin" : m.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== NEW CHAT MODAL ===== */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${bg} rounded-2xl shadow-xl w-full max-w-md max-h-[70vh] flex flex-col`}>
              <div className={`p-4 border-b ${border} flex items-center justify-between`}>
                <h3 className={`text-lg font-semibold ${text}`}>New Chat</h3>
                <button onClick={() => setShowNewChatModal(false)} className={textSecondary}>
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={`w-full px-4 py-2.5 ${inputBg} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {availableUsers
                  .filter((u) => u.userName.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((user) => (
                    <div
                      key={user.userId}
                      onClick={() => handleCreatePrivateChat(user.userId)}
                      className={`flex items-center px-4 py-3 cursor-pointer ${hover} transition-colors`}
                    >
                      <Avatar name={user.userName} src={user.avatar} size="w-10 h-10" online={user.isOnline} />
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${text}`}>{user.userName}</p>
                        <p className={`text-xs ${textSecondary}`}>{user.email}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== NEW GROUP MODAL ===== */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${bg} rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col`}>
              <div className={`p-4 border-b ${border} flex items-center justify-between`}>
                <h3 className={`text-lg font-semibold ${text}`}>Create Group</h3>
                <button onClick={() => setShowGroupModal(false)} className={textSecondary}>
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={`w-full px-4 py-2.5 ${inputBg} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={`w-full px-4 py-2.5 ${inputBg} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
                {selectedGroupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedGroupMembers.map((id) => {
                      const u = availableUsers.find((u) => u.userId === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {u?.userName}
                          <FiX
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => setSelectedGroupMembers((prev) => prev.filter((m) => m !== id))}
                          />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {availableUsers
                  .filter((u) => u.userName.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((user) => {
                    const isSelected = selectedGroupMembers.includes(user.userId);
                    return (
                      <div
                        key={user.userId}
                        onClick={() => {
                          setSelectedGroupMembers((prev) =>
                            isSelected ? prev.filter((m) => m !== user.userId) : [...prev, user.userId]
                          );
                        }}
                        className={`flex items-center px-4 py-3 cursor-pointer ${hover} transition-colors`}
                      >
                        <Avatar name={user.userName} src={user.avatar} size="w-10 h-10" online={user.isOnline} />
                        <div className="ml-3 flex-1">
                          <p className={`text-sm font-medium ${text}`}>{user.userName}</p>
                          <p className={`text-xs ${textSecondary}`}>{user.email}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "bg-blue-500 border-blue-500" : `${border}`
                          }`}
                        >
                          {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className={`p-4 border-t ${border}`}>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                  className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Group ({selectedGroupMembers.length} members)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context Menu */}
        {messageContextMenu && (
          <div
            className={`fixed z-50 ${bg} rounded-lg shadow-xl border ${border} py-1 min-w-[160px]`}
            style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
          >
            <button
              onClick={() => {
                setReplyTo(messageContextMenu.msg);
                setMessageContextMenu(null);
              }}
              className={`w-full px-4 py-2 text-left text-sm ${text} ${hover} flex items-center gap-2`}
            >
              <FiCornerUpLeft className="w-4 h-4" /> Reply
            </button>
            {messageContextMenu.msg.senderId === currentUserId && !messageContextMenu.msg.isDeleted && (
              <>
                <button
                  onClick={() => {
                    setEditingMessage(messageContextMenu.msg);
                    setMessage(messageContextMenu.msg.messageText || "");
                    setMessageContextMenu(null);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${text} ${hover} flex items-center gap-2`}
                >
                  <FiEdit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteMessage(messageContextMenu.msg.messageId)}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChatPageV2;
