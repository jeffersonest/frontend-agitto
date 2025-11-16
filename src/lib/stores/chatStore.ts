import { create } from "zustand";
import type { Message, TypingUser } from "../types/chat";

interface ChatStore {
  activeChatId: string | null;
  typingUsers: Record<string, TypingUser[]>;
  pendingMessages: Record<string, Message[]>;

  setActiveChatId: (chatId: string | null) => void;
  addTypingUser: (chatId: string, userId: string) => void;
  removeTypingUser: (chatId: string, userId: string) => void;
  addPendingMessage: (chatId: string, message: Message) => void;
  removePendingMessage: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeChatId: null,
  typingUsers: {},
  pendingMessages: {},

  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  addTypingUser: (chatId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: [
          ...(state.typingUsers[chatId] || []).filter((u) => u.userId !== userId),
          { userId, isTyping: true },
        ],
      },
    })),

  removeTypingUser: (chatId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: (state.typingUsers[chatId] || []).filter((u) => u.userId !== userId),
      },
    })),

  addPendingMessage: (chatId, message) =>
    set((state) => ({
      pendingMessages: {
        ...state.pendingMessages,
        [chatId]: [...(state.pendingMessages[chatId] || []), message],
      },
    })),

  removePendingMessage: (chatId, messageId) =>
    set((state) => ({
      pendingMessages: {
        ...state.pendingMessages,
        [chatId]: (state.pendingMessages[chatId] || []).filter((m) => m.id !== messageId),
      },
    })),
}));
