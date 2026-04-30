import api from "./api";
import type {
  ChatListItem,
  ChatMessage,
  ChatMember,
  ChatUser,
  SearchResult,
  UploadResult,
} from "../types/chat";

const BASE = "Chat";

const chatApi = {
  /** Get all chats for current user */
  async getChats(): Promise<ChatListItem[]> {
    const res = await api.request<ChatListItem[]>(`${BASE}/chats`);
    return res.data;
  },

  /** Create a private 1-to-1 chat */
  async createPrivateChat(otherUserId: number): Promise<{ chatId: number }> {
    const res = await api.request<{ chatId: number }>(`${BASE}/chats/private`, {
      method: "POST",
      body: JSON.stringify({ otherUserId }),
    });
    return res.data;
  },

  /** Create a group chat */
  async createGroupChat(
    name: string,
    memberIds: number[],
    imageUrl?: string
  ): Promise<{ chatId: number }> {
    const res = await api.request<{ chatId: number }>(`${BASE}/chats/group`, {
      method: "POST",
      body: JSON.stringify({ name, memberIds, imageUrl }),
    });
    return res.data;
  },

  /** Send a message */
  async sendMessage(data: {
    chatId: number;
    messageText?: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyToId?: number;
  }): Promise<ChatMessage> {
    const res = await api.request<ChatMessage>(`${BASE}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /** Get chat history with pagination */
  async getChatHistory(
    chatId: number,
    page: number = 1,
    pageSize: number = 50
  ): Promise<ChatMessage[]> {
    const res = await api.request<ChatMessage[]>(
      `${BASE}/messages/${chatId}?page=${page}&pageSize=${pageSize}`
    );
    return res.data;
  },

  /** Mark messages as read */
  async markAsRead(chatId: number): Promise<void> {
    await api.request(`${BASE}/messages/read/${chatId}`, { method: "POST" });
  },

  /** Edit a message */
  async editMessage(
    messageId: number,
    messageText: string
  ): Promise<ChatMessage> {
    const res = await api.request<ChatMessage>(`${BASE}/messages`, {
      method: "PUT",
      body: JSON.stringify({ messageId, messageText }),
    });
    return res.data;
  },

  /** Delete a message */
  async deleteMessage(messageId: number): Promise<void> {
    await api.request(`${BASE}/messages/${messageId}`, { method: "DELETE" });
  },

  /** Get chat members */
  async getChatMembers(chatId: number): Promise<ChatMember[]> {
    const res = await api.request<ChatMember[]>(
      `${BASE}/chats/${chatId}/members`
    );
    return res.data;
  },

  /** Add member to group */
  async addGroupMember(chatId: number, userId: number): Promise<void> {
    await api.request(`${BASE}/chats/members/add`, {
      method: "POST",
      body: JSON.stringify({ chatId, userId }),
    });
  },

  /** Remove member from group */
  async removeGroupMember(chatId: number, userId: number): Promise<void> {
    await api.request(`${BASE}/chats/members/remove`, {
      method: "POST",
      body: JSON.stringify({ chatId, userId }),
    });
  },

  /** Update group info */
  async updateGroup(
    chatId: number,
    name?: string,
    imageUrl?: string
  ): Promise<void> {
    await api.request(`${BASE}/chats/group`, {
      method: "PUT",
      body: JSON.stringify({ chatId, name, imageUrl }),
    });
  },

  /** Search messages */
  async searchMessages(
    q: string,
    chatId?: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResult[]> {
    let url = `${BASE}/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`;
    if (chatId) url += `&chatId=${chatId}`;
    const res = await api.request<SearchResult[]>(url);
    return res.data;
  },

  /** Get available users to chat with */
  async getAvailableUsers(): Promise<ChatUser[]> {
    const res = await api.request<ChatUser[]>(`${BASE}/users`);
    return res.data;
  },

  /** Toggle mute for a chat */
  async toggleMute(chatId: number): Promise<void> {
    await api.request(`${BASE}/chats/${chatId}/mute`, { method: "POST" });
  },

  /** Upload a file */
  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "${process.env.REACT_APP_API_BASE_URL}/";

    const response = await fetch(`${baseUrl}${BASE}/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    return response.json();
  },
};

export default chatApi;
