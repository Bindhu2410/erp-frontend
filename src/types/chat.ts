// Chat API Types
export interface ChatListItem {
  chatId: number;
  chatName: string | null;
  chatType: string;
  chatImageUrl: string | null;
  lastMessage: string | null;
  lastMessageType: string | null;
  lastMessageSender: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  memberCount: number;
  isMuted: boolean;
  otherUserId: number | null;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  otherUserOnline: boolean;
}

export interface ChatMessage {
  messageId: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  messageText: string | null;
  messageType: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  replyToId: number | null;
  replyText: string | null;
  replySenderName: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  dateCreated: string;
  readByCount: number;
  totalRecipients: number;
}

export interface ChatMember {
  userId: number;
  userName: string;
  avatar: string | null;
  role: string;
  isOnline: boolean;
  lastSeen: string | null;
  joinedAt: string | null;
}

export interface ChatUser {
  userId: number;
  userName: string;
  email: string | null;
  avatar: string | null;
  isOnline: boolean;
}

export interface SearchResult {
  messageId: number;
  chatId: number;
  chatName: string | null;
  senderName: string;
  messageText: string | null;
  messageType: string | null;
  dateCreated: string;
}

export interface SignalRMessage {
  messageId: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  messageText: string | null;
  messageType: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  replyToId: number | null;
  replyText: string | null;
  replySenderName: string | null;
  dateCreated: string;
}

export interface TypingIndicator {
  chatId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface PresenceUpdate {
  userId: number;
  isOnline: boolean;
  lastSeen: string | null;
}

export interface ReadReceipt {
  chatId: number;
  userId: number;
  userName: string;
  messageId?: number;
}

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  messageType: string;
}
