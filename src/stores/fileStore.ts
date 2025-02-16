import { create } from "zustand";

import { FileUploadStatus, UploadedFile } from "@/types";
import { getAllFilesFromDataTransfer } from "@/utils/fileUtils";
import { validateFiles } from "@/utils/fileValidation";

import { useUIStore } from "./uiStore";

interface FileState {
  // State
  files: Record<number, UploadedFile[]>;
  currentUploads: Record<string, FileUploadStatus>;
  isDragging: boolean;
  isLoading: boolean;

  // Actions
  addFiles: (chatId: number, files: File[]) => Promise<void>;
  removeFile: (chatId: number, fileId: string) => void;
  updateFileStatus: (fileId: string, status: Partial<FileUploadStatus>) => void;
  clearFiles: (chatId: number) => void;
  setDragging: (isDragging: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  handleFileDrop: (chatId: number, dataTransfer: DataTransfer) => Promise<void>;
  uploadFile: (file: File, fileId: string) => Promise<string>;

  // Getters
  getFilesByChatId: (chatId: number) => UploadedFile[];
  getUploadStatus: (fileId: string) => FileUploadStatus | undefined;
}

export const useFileStore = create<FileState>((set, get) => ({
  // Initial state
  files: {},
  currentUploads: {},
  isDragging: false,
  isLoading: false,

  // Actions
  setDragging: (isDragging) => set({ isDragging }),
  setLoading: (isLoading) => set({ isLoading }),

  handleFileDrop: async (chatId, dataTransfer) => {
    const files = await getAllFilesFromDataTransfer(dataTransfer);

    if (files.length === 0) {
      useUIStore.getState().addToast({
        type: "error",
        message: "No valid files found",
      });
      return;
    }

    const existingFiles = get().getFilesByChatId(chatId);
    const validation = validateFiles(files, existingFiles);

    if (!validation.valid) {
      useUIStore.getState().addToast({
        type: "error",
        message: validation.error || "Invalid files",
      });
      return;
    }

    return get().addFiles(chatId, files);
  },

  uploadFile: async (file: File, fileId: string) => {
    try {
      const chunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;

      // Initialize upload status
      set((state) => ({
        currentUploads: {
          ...state.currentUploads,
          [fileId]: {
            progress: 0,
            status: "uploading",
            totalSize: file.size,
            uploadedSize: 0,
            startTime: Date.now(),
          },
        },
      }));

      // Process each chunk
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        const start = chunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const fileChunk = file.slice(start, end);

        // Simulate chunk upload with delay
        await new Promise((resolve) => setTimeout(resolve, 200));
        uploadedChunks++;

        // Calculate metrics
        const uploadedSize = uploadedChunks * chunkSize;
        const currentTime = Date.now();
        const status = get().currentUploads[fileId];
        const elapsedTime = currentTime - status.startTime!;

        // Calculate speed (bytes per second)
        const uploadSpeed = uploadedSize / (elapsedTime / 1000);

        // Calculate progress (0-100)
        const progress = Math.round((uploadedSize / file.size) * 100);

        // Calculate remaining time (ms)
        const remainingTime = ((file.size - uploadedSize) / uploadSpeed) * 1000;

        // Update status with calculated metrics
        set((state) => ({
          currentUploads: {
            ...state.currentUploads,
            [fileId]: {
              ...state.currentUploads[fileId],
              progress,
              uploadedSize,
              uploadSpeed,
              remainingTime,
            },
          },
        }));
      }

      // Mark as completed
      set((state) => ({
        currentUploads: {
          ...state.currentUploads,
          [fileId]: {
            ...state.currentUploads[fileId],
            progress: 100,
            status: "completed",
            uploadedSize: file.size,
            completedAt: Date.now(),
          },
        },
      }));

      return URL.createObjectURL(file);
    } catch (error) {
      // Update error status
      set((state) => ({
        currentUploads: {
          ...state.currentUploads,
          [fileId]: {
            ...state.currentUploads[fileId],
            progress: 0,
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
            failedAt: Date.now(),
          },
        },
      }));

      // Instead of returning undefined, throw the error
      throw error;
    }
  },

  addFiles: async (chatId, newFiles) => {
    const { addToast } = useUIStore.getState();

    try {
      set({ isLoading: true });

      const filePromises = newFiles.map(async (file) => {
        const fileId = crypto.randomUUID();
        const uploadedFile: UploadedFile = {
          file_id: fileId,
          chat_id: chatId,
          name: file.name,
          size: file.size,
          type: file.type,
          created_at: new Date().toISOString(),
          uploadStatus: {
            progress: 0,
            status: "idle" as const,
          },
        };

        try {
          const uploadedUrl = await get().uploadFile(file, fileId);
          return {
            ...uploadedFile,
            url: uploadedUrl,
            uploadStatus: {
              progress: 100,
              status: "completed",
            },
          } satisfies UploadedFile;
        } catch (error) {
          console.error("🔴 File upload error:", {
            fileId,
            fileName: file.name,
            error,
          });
          throw error;
        }
      });

      const uploadedFiles = await Promise.all(filePromises);

      set((state) => ({
        files: {
          ...state.files,
          [chatId]: [...(state.files[chatId] || []), ...uploadedFiles],
        },
      }));

      addToast({
        type: "success",
        message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      addToast({
        type: "error",
        message: "Failed to upload some files",
      });
    } finally {
      set({ isLoading: false, isDragging: false });
    }
  },

  removeFile: (chatId, fileId) => {
    set((state) => {
      const file = state.files[chatId]?.find((f) => f.file_id === fileId);
      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }

      return {
        files: {
          ...state.files,
          [chatId]:
            state.files[chatId]?.filter((file) => file.file_id !== fileId) ||
            [],
        },
        currentUploads: Object.fromEntries(
          Object.entries(state.currentUploads).filter(([id]) => id !== fileId)
        ),
      };
    });
  },

  updateFileStatus: (fileId, status) => {
    set((state) => ({
      currentUploads: {
        ...state.currentUploads,
        [fileId]: {
          ...state.currentUploads[fileId],
          ...status,
        },
      },
    }));
  },

  clearFiles: (chatId) => {
    set((state) => {
      // Clean up object URLs before removing files
      state.files[chatId]?.forEach((file) => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });

      const { [chatId]: _, ...remainingFiles } = state.files;
      return { files: remainingFiles };
    });
  },

  // Getters
  getFilesByChatId: (chatId) => {
    return get().files[chatId] || [];
  },

  getUploadStatus: (fileId) => {
    return get().currentUploads[fileId];
  },
}));
