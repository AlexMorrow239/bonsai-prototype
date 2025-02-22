import { create } from "zustand";

import type { UploadedFile } from "@/types";

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
    const uploadedFiles: UploadedFile[] = files.map((file) => ({
      file_id: crypto.randomUUID(),
      chat_id: chatId,
      file,
      metadata: {
        file_id: crypto.randomUUID(),
        filename: file.name,
        mimetype: file.type,
        size: file.size,
      },
    }));

    set((state) => ({
      filesByChat: {
        ...state.filesByChat,
        [chatId]: [...(state.filesByChat[chatId] || []), ...uploadedFiles],
      },
    }));
  },
}));
