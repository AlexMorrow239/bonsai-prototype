import { create } from "zustand";

import type { Chat, Message } from "@/types";

interface ChatState {
  currentChat: Chat | null;
  chats: Chat[];
  shouldFocusInput: boolean;
  activeChatId: string | null;

  // Actions
  setCurrentChat: (chat: Chat) => void;
  updateChatPreview: (chatId: string, lastMessage: Message) => void;
  setShouldFocusInput: (value: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  setChats: (chats: Chat[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  currentChat: null,
  chats: [],
  shouldFocusInput: false,
  activeChatId: null,

  // Actions
  setShouldFocusInput: (value) => set({ shouldFocusInput: value }),
  setActiveChatId: (id) => set({ activeChatId: id }),

  setCurrentChat: (chat: Chat) => {
    set({ currentChat: chat });
  },

  updateChatPreview: (chatId, lastMessage) => {
    set((state) => {
      const chat = state.chats.find((c) => c._id === chatId);
      if (!chat) return state;

      const updatedChat = {
        ...chat,
        preview: lastMessage.content,
        last_message_at: lastMessage.created_at,
      };

      return {
        chats: state.chats.map((c) => (c._id === chatId ? updatedChat : c)),
      };
    });
  },

  setChats: (chats) => {
    set({ chats });
  },
}));
