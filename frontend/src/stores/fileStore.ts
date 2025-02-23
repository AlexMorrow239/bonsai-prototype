import { create } from "zustand";

import type { FileMetadata, UploadedFile } from "@/types";
import { createFileEntry } from "@/utils/files/fileUpload";

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
  handleFileDrop: (chatId: string, dataTransfer: DataTransfer) => Promise<void>;
  updatePendingFileStatus: (
    chatId: string,
    fileId: string,
    updates: Partial<{
      status: UploadedFile["status"];
      progress: number;
      metadata: Partial<FileMetadata>;
    }>
  ) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  pendingFilesByChat: {},
  isDragging: false,

  addPendingFiles: (chatId, files) =>
    set((state) => ({
      pendingFilesByChat: {
        ...state.pendingFilesByChat,
        [chatId]: [...(state.pendingFilesByChat[chatId] || []), ...files],
      },
    })),

  removePendingFile: (chatId, fileId) =>
    set((state) => ({
      pendingFilesByChat: {
        ...state.pendingFilesByChat,
        [chatId]: (state.pendingFilesByChat[chatId] || []).filter(
          (file) => file.file_id !== fileId
        ),
      },
    })),

  clearPendingFiles: (chatId) =>
    set((state) => ({
      pendingFilesByChat: {
        ...state.pendingFilesByChat,
        [chatId]: [],
      },
    })),

  getPendingFiles: (chatId) => {
    return get().pendingFilesByChat[chatId] || [];
  },

  setDragging: (isDragging) => set({ isDragging }),

  handleFileDrop: async (chatId, dataTransfer) => {
    const files = Array.from(dataTransfer.files);
    const uploadedFiles = files.map((file) => createFileEntry(file, chatId));

    set((state) => ({
      pendingFilesByChat: {
        ...state.pendingFilesByChat,
        [chatId]: [
          ...(state.pendingFilesByChat[chatId] || []),
          ...uploadedFiles,
        ],
      },
    }));
  },

  updatePendingFileStatus: (chatId, fileId, updates) =>
    set((state) => ({
      pendingFilesByChat: {
        ...state.pendingFilesByChat,
        [chatId]:
          state.pendingFilesByChat[chatId]?.map((file) =>
            file.file_id === fileId
              ? {
                  ...file,
                  ...updates,
                  metadata: {
                    ...file.metadata,
                    ...updates.metadata,
                  },
                }
              : file
          ) || [],
      },
    })),
}));
