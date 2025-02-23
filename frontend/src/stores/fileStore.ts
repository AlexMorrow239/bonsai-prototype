import { create } from "zustand";

import type { UploadedFile } from "@/types";

interface FileState {
  // Map of chatId to array of pending files (not yet associated with messages)
  pendingFilesByChat: Record<string, UploadedFile[]>;
  isDragging: boolean;

  // Actions
  addPendingFiles: (chatId: string, files: UploadedFile[]) => void;
  removePendingFile: (chatId: string, fileId: string) => void;
  clearPendingFiles: (chatId: string) => void;
  getPendingFiles: (chatId: string) => UploadedFile[];
  setDragging: (isDragging: boolean) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  pendingFilesByChat: {},
  isDragging: false,

  addPendingFiles: (chatId, files) => {
    set((state) => {
      const updatedFiles = [
        ...(state.pendingFilesByChat[chatId] || []),
        ...files,
      ];
      return {
        pendingFilesByChat: {
          ...state.pendingFilesByChat,
          [chatId]: updatedFiles,
        },
      };
    });
  },

  removePendingFile: (chatId, fileId) => {
    set((state) => {
      const updatedFiles = (state.pendingFilesByChat[chatId] || []).filter(
        (file) => file.file_id !== fileId
      );
      return {
        pendingFilesByChat: {
          ...state.pendingFilesByChat,
          [chatId]: updatedFiles,
        },
      };
    });
  },

  clearPendingFiles: (chatId) => {
    set((state) => ({
      pendingFilesByChat: {
        ...state.pendingFilesByChat,
        [chatId]: [],
      },
    }));
  },

  getPendingFiles: (chatId) => {
    return get().pendingFilesByChat[chatId] || [];
  },

  setDragging: (isDragging) => {
    set({ isDragging });
  },
}));
