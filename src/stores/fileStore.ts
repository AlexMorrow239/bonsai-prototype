import { create } from "zustand";

import { FILE_CONSTRAINTS } from "@/common/constants";

import {
  CompletedFile,
  type FileUploadStatus,
  type UploadedFile,
} from "@/types";
import { AppError } from "@/utils/errorUtils";
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
    const { showErrorToast } = useUIStore.getState();

    try {
      const files = await getAllFilesFromDataTransfer(dataTransfer);

      if (files.length === 0) {
        throw new AppError("No valid files found", "INVALID_INPUT");
      }

      const existingFiles = get().getFilesByChatId(chatId);
      const validation = validateFiles(files, existingFiles);

      if (!validation.valid) {
        throw new AppError(
          validation.error || "Invalid files",
          "INVALID_INPUT"
        );
      }

      await get().addFiles(chatId, files);
    } catch (error) {
      showErrorToast(error, "FileDrop");
    }
  },

  uploadFile: async (file: File, fileId: string) => {
    try {
      const CHUNK_SIZE = FILE_CONSTRAINTS.CHUNK_SIZE;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
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
            uploadSpeed: 0,
          },
        },
      }));

      // Simulate network conditions with error handling
      const minSpeed = FILE_CONSTRAINTS.MIN_UPLOAD_SPEED;
      const maxSpeed = FILE_CONSTRAINTS.MAX_UPLOAD_SPEED;
      let currentSpeed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

      // Process each chunk with error handling
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        // Simulate random network errors (1% chance)
        if (Math.random() < 0.01) {
          throw new AppError("Network connection interrupted", "NETWORK_ERROR");
        }

        const startByte = chunk * CHUNK_SIZE;
        const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
        const currentChunkSize = endByte - startByte;

        // Calculate dynamic delay based on simulated speed
        const delay = (currentChunkSize / currentSpeed) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Simulate speed variations with bounds
        currentSpeed = Math.max(
          minSpeed,
          Math.min(maxSpeed, currentSpeed * (0.8 + Math.random() * 0.4))
        );

        uploadedChunks++;
        const uploadedSize = Math.min(uploadedChunks * CHUNK_SIZE, file.size);
        const currentTime = Date.now();
        const status = get().currentUploads[fileId];

        if (!status?.startTime) {
          throw new AppError("Upload status not initialized", "SERVICE_ERROR");
        }

        const elapsedTime = currentTime - status.startTime;

        // Calculate metrics with safety checks
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
      const { showErrorToast } = useUIStore.getState();

      // Update upload status to error
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

      showErrorToast(error, `FileUpload:${file.name}`);
      throw error;
    }
  },

  addFiles: async (chatId, newFiles) => {
    const { showSuccessToast, showErrorToast } = useUIStore.getState();

    try {
      set({ isLoading: true });

      // Create initial file entries
      const initialFiles = newFiles.map((file) => ({
        file_id:
          crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
        chat_id: chatId,
        name: file.name,
        size: file.size,
        type: file.type,
        created_at: new Date().toISOString(),
        uploadStatus: {
          progress: 0,
          status: "uploading" as const,
        },
      }));

      // Add files to state
      set((state) => ({
        files: {
          ...state.files,
          [chatId]: [...(state.files[chatId] || []), ...initialFiles],
        },
      }));

      // Upload files
      const uploadResults = await Promise.allSettled(
        initialFiles.map(async (uploadedFile) => {
          const fileToUpload = newFiles.find(
            (f) => f.name === uploadedFile.name
          );

          if (!fileToUpload) {
            throw new AppError(
              `File ${uploadedFile.name} not found`,
              "SERVICE_ERROR"
            );
          }

          const uploadedUrl = await get().uploadFile(
            fileToUpload,
            uploadedFile.file_id
          );

          return {
            ...uploadedFile,
            url: uploadedUrl,
            uploadStatus: {
              progress: 100,
              status: "completed" as const,
            },
          } satisfies CompletedFile;
        })
      );

      // Process results with proper type predicate
      const successfulUploads = uploadResults
        .filter(
          (result): result is PromiseFulfilledResult<CompletedFile> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      const failedUploads = uploadResults.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      ).length;

      // Update state with completed files
      set((state) => ({
        files: {
          ...state.files,
          [chatId]: state.files[chatId].map(
            (file) =>
              successfulUploads.find((f) => f.file_id === file.file_id) || file
          ),
        },
      }));

      // Show appropriate toast
      if (successfulUploads.length > 0) {
        showSuccessToast(
          `Successfully uploaded ${successfulUploads.length} file(s)`
        );
      }

      if (failedUploads > 0) {
        showErrorToast(
          new AppError(
            `Failed to upload ${failedUploads} file(s)`,
            "SERVICE_ERROR"
          )
        );
      }
    } catch (error) {
      showErrorToast(error, "AddFiles");
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
      // Clean up object URLs
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
