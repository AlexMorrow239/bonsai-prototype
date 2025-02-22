import { useNavigate } from "react-router-dom";

import { create } from "zustand";

import type { Chat, Message } from "@/types";

interface ChatState {
  currentChat: Chat | null;
  chats: Chat[];
  shouldFocusInput: boolean;
  activeChatId: string | null;

  // Actions
  setCurrentChat: (
    chatId: string,
    navigate?: ReturnType<typeof useNavigate>
  ) => void;
  addMessage: (chatId: string, message: Message) => void;
  setShouldFocusInput: (value: boolean) => void;
  setActiveChatId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentChat: null,
  chats: [], // Will be populated from API
  shouldFocusInput: false,
  activeChatId: null,

  // Actions
  setShouldFocusInput: (value) => set({ shouldFocusInput: value }),
  setActiveChatId: (id) => set({ activeChatId: id }),

  setCurrentChat: (chatId, navigate) => {
    const chat = get().chats.find((c) => c._id === chatId);
    const pathname = window.location.pathname;

    if (pathname !== "/" && pathname !== "/chat" && navigate) {
      navigate("/chat");
    }

    set({ currentChat: chat || null });
  },

  addMessage: (chatId, message) => {
    set((state) => {
      const chat = state.chats.find((c) => c._id === chatId);
      if (!chat) return state;

      // Update chat preview with latest message
      const updatedChat = {
        ...chat,
        preview: message.content,
        last_message_at: message.created_at,
      };

      return {
        chats: state.chats.map((c) => (c._id === chatId ? updatedChat : c)),
      };
    });
  },
}));
