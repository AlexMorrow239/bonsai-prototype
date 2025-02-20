import { create } from "zustand";

import {
  CompletedFile,
  type FileUploadStatus,
  type UploadedFile,
} from "@/types";
import { AppError } from "@/utils/errorUtils";
import { getAllFilesFromDataTransfer } from "@/utils/files/fileTransfer";
import {
  cleanupFileUrl,
  createFileEntry,
  uploadFileWithProgress,
} from "@/utils/files/fileUpload";
import { validateFiles } from "@/utils/files/fileValidation";

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
  canSendMessage: (chatId: number) => boolean;
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
      const url = await uploadFileWithProgress(file, (status) => {
        get().updateFileStatus(fileId, status);
      });
      return url;
    } catch (error) {
      const { showErrorToast } = useUIStore.getState();
      showErrorToast(error, `FileUpload:${file.name}`);
      throw error;
    }
  },

  addFiles: async (chatId, newFiles) => {
    const { showSuccessToast, showErrorToast } = useUIStore.getState();

    try {
      set({ isLoading: true });

      // Create initial file entries
      const initialFiles = newFiles.map((file) =>
        createFileEntry(file, chatId)
      );

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

      // Process results
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
      cleanupFileUrl(file?.url);

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
        } as FileUploadStatus,
      },
    }));
  },

  clearFiles: (chatId) => {
    set((state) => {
      // Clean up object URLs
      state.files[chatId]?.forEach((file) => cleanupFileUrl(file.url));

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
  canSendMessage: (chatId) => {
    const files = get().getFilesByChatId(chatId);
    return !files.some(
      (file) =>
        file.uploadStatus.status === "error" ||
        file.uploadStatus.status === "uploading"
    );
  },
}));
