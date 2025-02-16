import { create } from "zustand";

import { mockChatData, mockChatsListData } from "@/data";
import type { Chat, ChatListItem, Message } from "@/types";

import { useProjectStore } from "./projectStore";

interface ChatState {
  // Current active chat
  currentChat: Chat | null;

  // Chat lists
  activeChats: ChatListItem[];
  archivedChats: ChatListItem[];

  // All chat data
  chats: Chat[];

  // Actions
  setCurrentChat: (chatId: number) => void;
  isRenamingChat: number | null; // Stores the chat ID being renamed
  setIsRenamingChat: (chatId: number | null) => void;
  addMessage: (chatId: number, message: Omit<Message, "message_id">) => void;
  archiveChat: (chatId: number) => void;
  unarchiveChat: (chatId: number) => void;
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
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentChat: null,
  isRenamingChat: null,
  activeChats: mockChatsListData.activeChats,
  archivedChats: mockChatsListData.archivedChats,
  chats: mockChatData.map((chat) => ({
    chatInfo: chat.chatInfo,
    messages: chat.messages,
  })),
  isResponseLoading: false,
  shouldFocusInput: false,
  setShouldFocusInput: (value) => set({ shouldFocusInput: value }),
  setResponseLoading: (loading) => set({ isResponseLoading: loading }),

  // Actions
  setCurrentChat: (chatId) => {
    const chat = get().chats.find((c) => c.chatInfo.chat_id === chatId);
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

      const updatedActiveChats = state.activeChats.map((chat) => {
        if (chat.chat_id === chatId) {
          return {
            ...chat,
            last_message_at: message.created_at,
            preview:
              message.content.slice(0, 100) +
              (message.content.length > 100 ? "..." : ""),
          };
        }
        return chat;
      });

      return {
        chats: updatedChats,
        activeChats: updatedActiveChats,
        currentChat:
          get().currentChat?.chatInfo.chat_id === chatId
            ? updatedChats.find((c) => c.chatInfo.chat_id === chatId) || null
            : get().currentChat,
      };
    });
  },

  archiveChat: (chatId) => {
    set((state) => {
      const chatToArchive = state.activeChats.find((c) => c.chat_id === chatId);
      if (!chatToArchive) return state;

      return {
        activeChats: state.activeChats.filter((c) => c.chat_id !== chatId),
        archivedChats: [
          ...state.archivedChats,
          { ...chatToArchive, is_active: false },
        ],
        chats: state.chats.map((chat) =>
          chat.chatInfo.chat_id === chatId
            ? { ...chat, chatInfo: { ...chat.chatInfo, is_active: false } }
            : chat
        ),
      };
    });
  },

  unarchiveChat: (chatId) => {
    set((state) => {
      const chatToUnarchive = state.archivedChats.find(
        (c) => c.chat_id === chatId
      );
      if (!chatToUnarchive) return state;

      return {
        archivedChats: state.archivedChats.filter((c) => c.chat_id !== chatId),
        activeChats: [
          ...state.activeChats,
          { ...chatToUnarchive, is_active: true },
        ],
        chats: state.chats.map((chat) =>
          chat.chatInfo.chat_id === chatId
            ? { ...chat, chatInfo: { ...chat.chatInfo, is_active: true } }
            : chat
        ),
      };
    });
  },

  createNewChat: (title: string, projectId?: number) => {
    set((state) => {
      const newChatId =
        Math.max(...state.chats.map((c) => c.chatInfo.chat_id)) + 1;

      // Only validate project if projectId is provided
      if (projectId) {
        const project = useProjectStore.getState().getProjectById(projectId);
        if (!project) return state;
      }

      const newChat: Chat = {
        chatInfo: {
          chat_id: newChatId,
          project_id: projectId, // This can be undefined
          title,
          is_active: true,
        },
        messages: [],
      };

      const newChatListItem: ChatListItem = {
        chat_id: newChatId,
        project_id: projectId,
        title,
        last_message_at: new Date().toISOString(),
        is_active: true,
        preview: "New chat created",
      };

      return {
        chats: [...state.chats, newChat],
        activeChats: [...state.activeChats, newChatListItem],
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
      activeChats: state.activeChats.map((chat) =>
        chat.chat_id === chatId ? { ...chat, title: newTitle } : chat
      ),
      archivedChats: state.archivedChats.map((chat) =>
        chat.chat_id === chatId ? { ...chat, title: newTitle } : chat
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
