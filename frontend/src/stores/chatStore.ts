import { create } from "zustand";

import { useMessageStore } from "@/stores/messageStore";
import type { Chat, Message, UploadedFile } from "@/types";

interface ChatState {
  currentChat: Chat | null;
  chats: Chat[];
  shouldFocusInput: boolean;
  activeChatId: string | null;
  // File management state
  pendingFilesByChat: Record<string, UploadedFile[]>;
  isDragging: boolean;

  // Chat Actions
  setCurrentChat: (chat: Chat | null) => void;
  updateChatPreview: (chatId: string, lastMessage: Message) => void;
  setShouldFocusInput: (value: boolean) => void;
  setActiveChatId: (id: string | null) => void;
  setChats: (chats: Chat[]) => void;
  removeMessage: (chatId: string, messageId: string) => void;

  // File management actions
  addPendingFiles: (chatId: string | null, files: UploadedFile[]) => void;
  removePendingFile: (chatId: string | null, fileId: string) => void;
  clearPendingFiles: (chatId: string | null) => void;
  getPendingFiles: (chatId: string | null) => UploadedFile[];
  setDragging: (isDragging: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial chat state
  currentChat: null,
  chats: [],
  shouldFocusInput: false,
  activeChatId: null,
  // Initial file management state
  pendingFilesByChat: {},
  isDragging: false,

  // Chat Actions
  setShouldFocusInput: (value) => set({ shouldFocusInput: value }),
  setActiveChatId: (id) => set({ activeChatId: id }),

  setCurrentChat: (chat) => {
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

  removeMessage: (chatId, messageId) => {
    set((state) => {
      const chat = state.chats.find((c) => c._id === chatId);
      if (!chat) return state;

      if (chat.preview === messageId) {
        const messages = useMessageStore.getState().getMessagesByChatId(chatId);
        const previousMessage = messages[messages.length - 2];

        return {
          chats: state.chats.map((c) =>
            c._id === chatId
              ? { ...c, preview: previousMessage?.content || "" }
              : c
          ),
        };
      }
      return state;
    });
  },

  // File management actions
  addPendingFiles: (chatId, files) => {
    const key = chatId || "pending";
    set((state) => {
      const updatedFiles = [...(state.pendingFilesByChat[key] || []), ...files];
      return {
        pendingFilesByChat: {
          ...state.pendingFilesByChat,
          [key]: updatedFiles,
        },
      };
    });
  },

  removePendingFile: (chatId, fileId) => {
    const key = chatId || "pending";
    set((state) => {
      const updatedFiles = (state.pendingFilesByChat[key] || []).filter(
        (file) => file.file_id !== fileId
      );
      return {
        pendingFilesByChat: {
          ...state.pendingFilesByChat,
          [key]: updatedFiles,
        },
      };
    });
  },

  clearPendingFiles: (chatId) => {
    const key = chatId || "pending";
    set((state) => ({
      pendingFilesByChat: {
        ...state.pendingFilesByChat,
        [key]: [],
      },
    }));
  },

  getPendingFiles: (chatId) => {
    const key = chatId || "pending";
    return get().pendingFilesByChat[key] || [];
  },

  setDragging: (isDragging) => {
    set({ isDragging });
  },
}));
