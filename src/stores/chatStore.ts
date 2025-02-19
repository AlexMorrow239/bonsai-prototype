import { useNavigate } from "react-router-dom";

import { create } from "zustand";

import { mockChatData } from "@/data";
import type { Chat, Message } from "@/types";

import { useProjectStore } from "./projectStore";

// ... existing code ...

interface ChatState {
  // Current active chat
  currentChat: Chat | null;

  // All chat data
  chats: Chat[];

  // Actions
  setCurrentChat: (
    chatId: number,
    navigate?: ReturnType<typeof useNavigate>
  ) => void;
  isRenamingChat: number | null; // Stores the chat ID being renamed
  setIsRenamingChat: (chatId: number | null) => void;
  addMessage: (chatId: number, message: Omit<Message, "message_id">) => void;
  createNewChat: (title: string, projectId?: number) => void;
  updateChatTitle: (chatId: number, newTitle: string) => void;
  shouldFocusInput: boolean;
  setShouldFocusInput: (value: boolean) => void;
  isResponseLoading: boolean;

  // Helper functions
  getChatById: (chatId: number) => Chat | undefined;
  getChatsByProject: (projectId: number) => Chat[];
  getLastMessage: (chatId: number) => Message | undefined;
  setResponseLoading: (loading: boolean) => void;
  getUnassociatedChats: () => Chat[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentChat: null,
  isRenamingChat: null,
  chats: mockChatData.map((chat) => ({
    chatInfo: {
      chat_id: chat.chatInfo.chat_id,
      project_id: chat.chatInfo.project_id,
      title: chat.chatInfo.title,
      last_message_at:
        chat.messages[chat.messages.length - 1]?.created_at ||
        new Date().toISOString(),
      preview: chat.messages[chat.messages.length - 1]?.content || "",
    },
    messages: chat.messages,
  })),
  isResponseLoading: false,
  shouldFocusInput: false,
  setShouldFocusInput: (value) => set({ shouldFocusInput: value }),
  setResponseLoading: (loading) => set({ isResponseLoading: loading }),
  getUnassociatedChats: () => {
    return get().chats.filter((chat) => !chat.chatInfo.project_id);
  },
  setCurrentChat: (chatId, navigate) => {
    const chat = get().chats.find((c) => c.chatInfo.chat_id === chatId);
    const pathname = window.location.pathname;

    // Navigate to chat page if not already there
    if (pathname !== "/" && pathname !== "/chat") {
      if (navigate) {
        navigate("/chat");
      }
    }

    set({ currentChat: chat || null });
  },

  setIsRenamingChat: (chatId) => {
    set({ isRenamingChat: chatId });
  },

  addMessage: (chatId, message) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.chatInfo.chat_id === chatId) {
          const newMessageId =
            Math.max(...chat.messages.map((m) => m.message_id)) + 1;
          return {
            ...chat,
            messages: [
              ...chat.messages,
              { ...message, message_id: newMessageId },
            ],
          };
        }
        return chat;
      });

      return {
        chats: updatedChats,
        currentChat:
          get().currentChat?.chatInfo.chat_id === chatId
            ? updatedChats.find((c) => c.chatInfo.chat_id === chatId) || null
            : get().currentChat,
      };
    });
  },

  createNewChat: (title: string, projectId?: number) => {
    set((state) => {
      const newChatId =
        Math.max(...state.chats.map((c) => c.chatInfo.chat_id)) + 1;

      // Only validate project if projectId is provided
      if (projectId !== undefined) {
        const project = useProjectStore.getState().getProjectById(projectId);
        if (!project) return state;
      }

      const newChat: Chat = {
        chatInfo: {
          chat_id: newChatId,
          project_id: projectId || null,
          title,
        },
        messages: [],
      };

      return {
        chats: [...state.chats, newChat],
        currentChat: newChat,
        shouldFocusInput: true,
      };
    });
  },

  updateChatTitle: (chatId, newTitle) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.chatInfo.chat_id === chatId
          ? { ...chat, chatInfo: { ...chat.chatInfo, title: newTitle } }
          : chat
      ),
    }));
  },

  // Helper functions
  getChatById: (chatId) => {
    return get().chats.find((chat) => chat.chatInfo.chat_id === chatId);
  },

  getChatsByProject: (projectId) => {
    return get().chats.filter((chat) => chat.chatInfo.project_id === projectId);
  },

  getLastMessage: (chatId) => {
    const chat = get().chats.find((c) => c.chatInfo.chat_id === chatId);
    if (!chat || chat.messages.length === 0) return undefined;
    return chat.messages[chat.messages.length - 1];
  },
}));
