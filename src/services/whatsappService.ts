import api from "./api";

export interface WhatsAppMessage {
  id: number;
  messageText: string;
  senderId: number | string;
  senderName: string;
  dateCreated: string;
  messageType: "in" | "out";
  status?: string;
}

export interface WhatsAppLead {
  leadId: string;
  customerName: string;
  phoneNumber: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  status?: string;
}

export interface WhatsAppAccount {
  id: number;
  userId: number;
  phoneNumberId: string;
  phoneNumber: string;
  displayName?: string;
  wabaId: string;
  isActive: boolean;
}

const BASE = "WhatsApp";

/** Help build URL with query params for the fetch-based api wrapper */
const buildUrl = (endpoint: string, params: Record<string, any> = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      query.append(key, val.toString());
    }
  });
  const queryString = query.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

export const whatsappService = {
  /** Fetch all leads for WhatsApp chat list */
  async getWhatsAppLeads(userId?: number): Promise<WhatsAppLead[]> {
    const url = buildUrl(`${BASE}/leads`, { userId });
    const response = await api.get(url, {});
    return response.data || [];
  },

  /** Send a message to a specific phone number */
  async sendMessage(phoneNumber: string, messageText: string, userId?: number): Promise<any> {
    const url = buildUrl(`${BASE}/send`, { userId });
    const response = await api.post(url, {
      phoneNumber,
      message: messageText,
    }, {});
    return response.data;
  },

  /** Get message history with a specific customer */
  async getConversation(phoneNumber: string, userId?: number): Promise<WhatsAppMessage[]> {
    const url = buildUrl(`${BASE}/conversation/${phoneNumber}`, { userId });
    const response = await api.get(url, {});
    return response.data || [];
  },

  /** Mark a conversation as read */
  async markAsRead(phoneNumber: string, userId?: number): Promise<void> {
    const url = buildUrl(`${BASE}/read/${phoneNumber}`, { userId });
    await api.post(url, {}, {});
  },

  /** Database Initialization */
  async initDb(): Promise<any> {
    const response = await api.post(`${BASE}/init-db`, {}, {});
    return response.data;
  },

  /** Register a new WhatsApp API account */
  async registerAccount(data: any): Promise<any> {
    const response = await api.post(`${BASE}/accounts/register`, data, {});
    return response.data;
  },

  /** List accounts for a user */
  async getAccounts(userId: number): Promise<WhatsAppAccount[]> {
    const url = buildUrl(`${BASE}/accounts`, { userId });
    const response = await api.get(url, {});
    return response.data?.data || [];
  }
};

export default whatsappService;
