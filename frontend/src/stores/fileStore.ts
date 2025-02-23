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
    console.debug("[FileStore] Adding pending files:", {
      chatId,
      fileCount: files.length,
      files: files.map((f) => ({
        id: f.file_id,
        name: f.metadata.name,
        size: f.metadata.size,
        type: f.metadata.mimetype,
      })),
    });

    set((state) => {
      const updatedFiles = [
        ...(state.pendingFilesByChat[chatId] || []),
        ...files,
      ];
      console.debug("[FileStore] Updated pending files state:", {
        chatId,
        totalFiles: updatedFiles.length,
      });
      return {
        pendingFilesByChat: {
          ...state.pendingFilesByChat,
          [chatId]: updatedFiles,
        },
      };
    });
  },

  removePendingFile: (chatId, fileId) => {
    console.debug("[FileStore] Removing pending file:", {
      chatId,
      fileId,
    });

    set((state) => {
      const updatedFiles = (state.pendingFilesByChat[chatId] || []).filter(
        (file) => file.file_id !== fileId
      );
      console.debug("[FileStore] Updated files after removal:", {
        chatId,
        remainingFiles: updatedFiles.length,
      });
      return {
        pendingFilesByChat: {
          ...state.pendingFilesByChat,
          [chatId]: updatedFiles,
        },
      };
    });
  },

  clearPendingFiles: (chatId) => {
    console.debug("[FileStore] Clearing all pending files for chat:", chatId);
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
