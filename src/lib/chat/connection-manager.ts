import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "../config";
import { getAccessToken } from "../api/http";
import type { Message } from "../types/chat";

type MessageHandler = (message: Message) => void;
type TypingHandler = (data: { userId: string; isTyping: boolean }) => void;
type ReadHandler = (data: { messageId: string }) => void;

export class ChatConnectionManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageHandlers: MessageHandler[] = [];
  private typingHandlers: TypingHandler[] = [];
  private readHandlers: ReadHandler[] = [];

  connect() {
    const token = getAccessToken();
    if (!token) return;

    const baseUrl = getApiBaseUrl();
    this.socket = io(`${baseUrl}/chat`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      this.reconnectAttempts++;
    });

    this.socket.on("message:new", (message: Message) => {
      this.messageHandlers.forEach((handler) => handler(message));
    });

    this.socket.on("user:typing", (data: { userId: string; isTyping: boolean }) => {
      this.typingHandlers.forEach((handler) => handler(data));
    });

    this.socket.on("message:read", (data: { messageId: string }) => {
      this.readHandlers.forEach((handler) => handler(data));
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinChat(chatId: string) {
    this.socket?.emit("chat:join", { chatId });
  }

  leaveChat(chatId: string) {
    this.socket?.emit("chat:leave", { chatId });
  }

  sendTyping(chatId: string, isTyping: boolean) {
    this.socket?.emit("message:typing", { chatId, isTyping });
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onTyping(handler: TypingHandler) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler);
    };
  }

  onRead(handler: ReadHandler) {
    this.readHandlers.push(handler);
    return () => {
      this.readHandlers = this.readHandlers.filter((h) => h !== handler);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const chatConnectionManager = new ChatConnectionManager();
