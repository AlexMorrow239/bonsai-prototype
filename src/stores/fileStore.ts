import { create } from "zustand";

import { FileUploadStatus, UploadedFile } from "@/types";
import { getAllFilesFromDataTransfer } from "@/utils/fileUtils";
import { validateFiles } from "@/utils/fileValidation";

import { useLoadingStore } from "./loadingStore";
import { useUIStore } from "./uiStore";

interface FileState {
  // State
  files: Record<number, UploadedFile[]>;
  currentUploads: Record<string, FileUploadStatus>;
  isDragging: boolean;

  // Actions
  addFiles: (chatId: number, files: File[]) => Promise<void>;
  removeFile: (chatId: number, fileId: string) => void;
  updateFileStatus: (fileId: string, status: Partial<FileUploadStatus>) => void;
  clearFiles: (chatId: number) => void;
  setDragging: (isDragging: boolean) => void;
  handleFileDrop: (chatId: number, dataTransfer: DataTransfer) => Promise<void>;

  // Getters
  getFilesByChatId: (chatId: number) => UploadedFile[];
  getUploadStatus: (fileId: string) => FileUploadStatus | undefined;
}

export const useFileStore = create<FileState>((set, get) => ({
  // Initial state
  files: {},
  currentUploads: {},
  isDragging: false,

  // Actions
  setDragging: (isDragging) => set({ isDragging }),

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

  addFiles: async (chatId, newFiles) => {
    const { addToast } = useUIStore.getState();
    const { setLoading } = useLoadingStore.getState();

    try {
      setLoading(true);

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

        // Initialize upload status
        set((state) => ({
          currentUploads: {
            ...state.currentUploads,
            [fileId]: { progress: 0, status: "uploading" },
          },
        }));

        try {
          // Simulate upload progress (replace with actual upload logic)
          await simulateFileUpload(fileId, get().updateFileStatus);

          const uploadedUrl = URL.createObjectURL(file);
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

          set((state) => ({
            currentUploads: {
              ...state.currentUploads,
              [fileId]: {
                progress: 0,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              },
            },
          }));
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
      console.error("🔴 Upload error:", error);
      addToast({
        type: "error",
        message: "Failed to upload some files",
      });
    } finally {
      setLoading(false);
      set({ isDragging: false });
    }
  },

  removeFile: (chatId, fileId) => {
    set((state) => ({
      files: {
        ...state.files,
        [chatId]:
          state.files[chatId]?.filter((file) => file.file_id !== fileId) || [],
      },
      currentUploads: Object.fromEntries(
        Object.entries(state.currentUploads).filter(([id]) => id !== fileId)
      ),
    }));
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

// Helper function to simulate file upload (remove when implementing real upload)
async function simulateFileUpload(
  fileId: string,
  updateStatus: (fileId: string, status: Partial<FileUploadStatus>) => void
) {
  for (let progress = 0; progress <= 100; progress += 10) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    updateStatus(fileId, { progress });
  }
}
