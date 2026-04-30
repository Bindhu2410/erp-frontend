import { useEffect, useRef, useCallback, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type {
  SignalRMessage,
  TypingIndicator,
  PresenceUpdate,
  ReadReceipt,
} from "../types/chat";

const HUB_URL =
  (process.env.REACT_APP_API_BASE_URL || "process.env.REACT_APP_API_BASE_URL").replace(
    /\/api\/?$/,
    ""
  ) + "/chathub";

export interface UseChatHubOptions {
  onReceiveMessage?: (msg: SignalRMessage) => void;
  onUserTyping?: (data: TypingIndicator) => void;
  onUserOnline?: (data: PresenceUpdate) => void;
  onUserOffline?: (data: PresenceUpdate) => void;
  onMessagesRead?: (data: ReadReceipt) => void;
  onMessageEdited?: (msg: any) => void;
  onMemberAdded?: (data: { chatId: number; userId: number }) => void;
  onMemberRemoved?: (data: { chatId: number; userId: number }) => void;
  onChatCreated?: (data: { chatId: number; name: string; chatType: string }) => void;
  onGroupUpdated?: (data: { chatId: number; name: string; imageUrl: string }) => void;
}

export function useChatHub(options: UseChatHubOptions = {}) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Register handlers
    connection.on("ReceiveMessage", (msg: SignalRMessage) => {
      optionsRef.current.onReceiveMessage?.(msg);
    });

    connection.on("UserTyping", (data: TypingIndicator) => {
      optionsRef.current.onUserTyping?.(data);
    });

    connection.on("UserOnline", (data: PresenceUpdate) => {
      optionsRef.current.onUserOnline?.(data);
    });

    connection.on("UserOffline", (data: PresenceUpdate) => {
      optionsRef.current.onUserOffline?.(data);
    });

    connection.on("MessagesRead", (data: ReadReceipt) => {
      optionsRef.current.onMessagesRead?.(data);
    });

    connection.on("MessageEdited", (msg: any) => {
      optionsRef.current.onMessageEdited?.(msg);
    });

    connection.on("MemberAdded", (data: { chatId: number; userId: number }) => {
      optionsRef.current.onMemberAdded?.(data);
    });

    connection.on("MemberRemoved", (data: { chatId: number; userId: number }) => {
      optionsRef.current.onMemberRemoved?.(data);
    });

    connection.on("ChatCreated", (data: { chatId: number; name: string; chatType: string }) => {
      optionsRef.current.onChatCreated?.(data);
    });

    connection.on("GroupUpdated", (data: { chatId: number; name: string; imageUrl: string }) => {
      optionsRef.current.onGroupUpdated?.(data);
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => console.error("SignalR connection error:", err));

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(
    async (request: {
      chatId: number;
      messageText?: string;
      messageType?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      replyToId?: number;
    }) => {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("SendMessage", request);
      }
    },
    []
  );

  const sendTyping = useCallback(async (chatId: number, isTyping: boolean) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("Typing", chatId, isTyping);
    }
  }, []);

  const markAsRead = useCallback(async (chatId: number) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("MarkAsRead", chatId);
    }
  }, []);

  const joinChat = useCallback(async (chatId: number) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("JoinChat", chatId);
    }
  }, []);

  const leaveChat = useCallback(async (chatId: number) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("LeaveChat", chatId);
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    sendTyping,
    markAsRead,
    joinChat,
    leaveChat,
    connection: connectionRef,
  };
}
