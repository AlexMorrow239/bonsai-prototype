import { create } from "zustand";

import type { FileMetadata, UploadedFile } from "@/types";
import { createFileEntry } from "@/utils/files/fileUpload";

interface FileState {
  // Map of chatId to array of files
  filesByChat: Record<string, UploadedFile[]>;
  isDragging: boolean;

  // Actions
  addFiles: (chatId: string, files: UploadedFile[]) => void;
  removeFile: (chatId: string, fileId: string) => void;
  clearFiles: (chatId: string) => void;
  getFilesByChatId: (chatId: string) => UploadedFile[];
  setDragging: (isDragging: boolean) => void;
  handleFileDrop: (chatId: string, dataTransfer: DataTransfer) => Promise<void>;
  updateFileStatus: (
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
  filesByChat: {},
  isDragging: false,

  addFiles: (chatId, files) =>
    set((state) => ({
      filesByChat: {
        ...state.filesByChat,
        [chatId]: [...(state.filesByChat[chatId] || []), ...files],
      },
    })),

  removeFile: (chatId, fileId) =>
    set((state) => ({
      filesByChat: {
        ...state.filesByChat,
        [chatId]: (state.filesByChat[chatId] || []).filter(
          (file) => file.file_id !== fileId
        ),
      },
    })),

  clearFiles: (chatId) =>
    set((state) => ({
      filesByChat: {
        ...state.filesByChat,
        [chatId]: [],
      },
    })),

  getFilesByChatId: (chatId) => {
    return get().filesByChat[chatId] || [];
  },

  setDragging: (isDragging) => set({ isDragging }),

  handleFileDrop: async (chatId, dataTransfer) => {
    const files = Array.from(dataTransfer.files);
    const uploadedFiles = files.map((file) => createFileEntry(file, chatId));

    set((state) => ({
      filesByChat: {
        ...state.filesByChat,
        [chatId]: [...(state.filesByChat[chatId] || []), ...uploadedFiles],
      },
    }));
  },

  updateFileStatus: (chatId, fileId, updates) =>
    set((state) => ({
      filesByChat: {
        ...state.filesByChat,
        [chatId]:
          state.filesByChat[chatId]?.map((file) =>
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
