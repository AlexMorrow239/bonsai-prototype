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
      const CHUNK_SIZE = 256 * 1024; // 256KB chunks for more frequent updates
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;

      // Initialize upload status immediately
      set((state) => ({
        currentUploads: {
          ...state.currentUploads,
          [fileId]: {
            progress: 0,
            status: "uploading",
            totalSize: file.size,
            uploadedSize: 0,
            startTime: Date.now(),
            uploadSpeed: 0,
          },
        },
      }));

      // Simulate network conditions
      const minSpeed = 500 * 1024; // 500KB/s minimum
      const maxSpeed = 2 * 1024 * 1024; // 2MB/s maximum
      let currentSpeed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

      // Process each chunk with variable speed
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        const startByte: number = chunk * CHUNK_SIZE;
        const endByte: number = Math.min(startByte + CHUNK_SIZE, file.size);
        const currentChunkSize: number = endByte - startByte;

        // Calculate dynamic delay based on simulated speed
        const delay = (currentChunkSize / currentSpeed) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Simulate speed variations
        currentSpeed = Math.max(
          minSpeed,
          Math.min(
            maxSpeed,
            currentSpeed * (0.8 + Math.random() * 0.4) // Speed varies by ±20%
          )
        );

        uploadedChunks++;
        const uploadedSize = Math.min(uploadedChunks * CHUNK_SIZE, file.size);
        const currentTime = Date.now();
        const status = get().currentUploads[fileId];
        const elapsedTime = currentTime - status.startTime!;

        // Calculate metrics
        const progress = Math.round((uploadedSize / file.size) * 100);
        const uploadSpeed = uploadedSize / (elapsedTime / 1000);
        const remainingSize = file.size - uploadedSize;
        const remainingTime = (remainingSize / uploadSpeed) * 1000;

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

      // Add small delay before marking as completed
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      // Error handling remains the same
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
      throw error;
    }
  },

  addFiles: async (chatId, newFiles) => {
    const { addToast } = useUIStore.getState();

    try {
      set({ isLoading: true });

      // Create initial file entries immediately
      const initialFiles = newFiles.map((file) => {
        const fileId = crypto.randomUUID();
        return {
          file_id: fileId,
          chat_id: chatId,
          name: file.name,
          size: file.size,
          type: file.type,
          created_at: new Date().toISOString(),
          uploadStatus: {
            progress: 0,
            status: "uploading" as const,
          },
        } satisfies UploadedFile;
      });

      // Add files to state immediately
      set((state) => ({
        files: {
          ...state.files,
          [chatId]: [...(state.files[chatId] || []), ...initialFiles],
        },
      }));

      // Start uploads in parallel
      const uploadPromises = initialFiles.map(async (uploadedFile) => {
        try {
          const uploadedUrl = await get().uploadFile(
            newFiles.find((f) => f.name === uploadedFile.name)!,
            uploadedFile.file_id
          );
          return {
            ...uploadedFile,
            url: uploadedUrl,
            uploadStatus: {
              progress: 100,
              status: "completed" as const,
            },
          } satisfies UploadedFile;
        } catch (error) {
          console.error("🔴 File upload error:", {
            fileId: uploadedFile.file_id,
            fileName: uploadedFile.name,
            error,
          });
          throw error;
        }
      });

      const completedFiles = await Promise.all(uploadPromises);

      // Update state with completed files
      set((state) => ({
        files: {
          ...state.files,
          [chatId]: state.files[chatId].map(
            (file) =>
              completedFiles.find((f) => f.file_id === file.file_id) || file
          ),
        },
      }));

      addToast({
        type: "success",
        message: `Successfully uploaded ${completedFiles.length} file(s)`,
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
