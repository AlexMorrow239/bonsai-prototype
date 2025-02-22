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
  updateChatPreview: (chatId: string, lastMessage: Message) => void;
  setShouldFocusInput: (value: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  setChats: (chats: Chat[]) => void;
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

  setChats: (chats) =>
    set((state) => {
      // Update current chat reference if it exists
      const currentChat = state.currentChat
        ? chats.find((c) => c._id === state.currentChat?._id) || null
        : null;

      return {
        chats,
        currentChat,
      };
    }),
}));
