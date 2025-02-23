import { create } from "zustand";

import type { UploadedFile } from "@/types";

interface FileState {
  // Map of chatId to array of pending files (not yet associated with messages)
  // Uses 'pending' as special key for files without a chat
  pendingFilesByChat: Record<string, UploadedFile[]>;
  isDragging: boolean;

  // Actions
  addPendingFiles: (chatId: string | null, files: UploadedFile[]) => void;
  removePendingFile: (chatId: string | null, fileId: string) => void;
  clearPendingFiles: (chatId: string | null) => void;
  getPendingFiles: (chatId: string | null) => UploadedFile[];
  setDragging: (isDragging: boolean) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  pendingFilesByChat: {},
  isDragging: false,

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
