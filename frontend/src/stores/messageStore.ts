import { create } from "zustand";

import type { Message } from "@/types";

interface MessageState {
  // Map of chatId to array of messages
  messagesByChat: Record<string, Message[]>;

  // Actions
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  clearMessages: (chatId: string) => void;
  getMessagesByChatId: (chatId: string) => Message[];
  removeMessage: (chatId: string, messageId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByChat: {},

  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: messages,
      },
    })),

  addMessage: (chatId, message) =>
    set((state) => {
      const existingMessages = state.messagesByChat[chatId] || [];
      // Prevent duplicate messages
      const isDuplicate = existingMessages.some(
        (m) => m._id === `temp-${Date.now()}`
      );

      if (isDuplicate) return state;

      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...existingMessages, message],
        },
      };
    }),

  clearMessages: (chatId) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [],
      },
    })),

  getMessagesByChatId: (chatId) => {
    return get().messagesByChat[chatId] || [];
  },

  removeMessage: (chatId, messageId) =>
    set((state) => {
      const messages = state.messagesByChat[chatId] || [];
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: messages.filter((m) => m._id !== messageId),
        },
      };
    }),
}));
