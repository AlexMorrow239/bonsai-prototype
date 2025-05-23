import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type {
  ApiError,
  ApiResponse,
  CreateFolderData,
  FileSystemEntity,
  UpdateFileData,
  UploadFileData,
} from "@/types";

export interface QueryFileParams {
  parentFolderId?: string | null;
  isFolder?: boolean;
  isTrashed?: boolean;
  isStarred?: boolean;
  isActive?: boolean;
  mimeType?: string;
  name?: string;
  path?: string;
}

// Query files in a folder
export function useFiles(params?: QueryFileParams) {
  return useQuery<FileSystemEntity[], AxiosError<ApiError>>({
    queryKey: ["files", "list", params?.parentFolderId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<FileSystemEntity[]>>(
        "/files",
        {
          params,
        }
      );
      return response.data.data;
    },
  });
}

// Get a single file by ID
export function useFile(fileId: string, options: { enabled?: boolean } = {}) {
  return useQuery<FileSystemEntity, AxiosError<ApiError>>({
    queryKey: ["files", fileId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<FileSystemEntity>>(
        `/files/${fileId}`
      );
      return response.data.data;
    },
    enabled:
      options.enabled !== undefined
        ? options.enabled
        : !!fileId && fileId !== "",
  });
}

// Upload a file
export function useUploadFile() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, UploadFileData>({
    mutationFn: async ({ file, ...data }) => {
      const formData = new FormData();
      formData.append("file", file);

      if (data.name) formData.append("name", data.name);
      formData.append("parentFolderId", data.parentFolderId || "null");
      if (data.customMetadata) {
        formData.append("customMetadata", JSON.stringify(data.customMetadata));
      }

      const response = await apiClient.post<ApiResponse<FileSystemEntity>>(
        "/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    },
  });
}

// Create a folder
export function useCreateFolder() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, CreateFolderData>({
    mutationFn: async (folderData) => {
      const response = await apiClient.post<ApiResponse<FileSystemEntity>>(
        "/files/folders",
        folderData
      );
      return response.data.data;
    },
  });
}

// Update a file
export function useUpdateFile() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, UpdateFileData>({
    mutationFn: async ({ _id, ...fileData }) => {
      const response = await apiClient.patch<ApiResponse<FileSystemEntity>>(
        `/files/${_id}`,
        fileData
      );
      return response.data.data;
    },
  });
}

// Delete a file
export function useDeleteFile() {
  return useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (fileId) => {
      await apiClient.delete(`/files/${fileId}`);
    },
  });
}

// Restore a file from trash
export function useRestoreFile() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, string>({
    mutationFn: async (fileId) => {
      const response = await apiClient.post<ApiResponse<FileSystemEntity>>(
        `/files/${fileId}/restore`
      );
      return response.data.data;
    },
  });
}

// Toggle star status of a file
export function useToggleFileStar() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, string>({
    mutationFn: async (fileId) => {
      const response = await apiClient.post<ApiResponse<FileSystemEntity>>(
        `/files/${fileId}/star`
      );
      return response.data.data;
    },
  });
}

// Move a file
export function useMoveFile() {
  return useMutation<
    FileSystemEntity,
    AxiosError<ApiError>,
    { fileId: string; targetFolderId: string | null }
  >({
    mutationFn: async ({ fileId, targetFolderId }) => {
      const response = await apiClient.post<ApiResponse<FileSystemEntity>>(
        `/files/${fileId}/move`,
        { targetFolderId }
      );
      return response.data.data;
    },
  });
}

// Download a file
export function useDownloadFile() {
  return useMutation<Blob, AxiosError<ApiError>, string>({
    mutationFn: async (fileId) => {
      const response = await apiClient.get(`/files/${fileId}/download`, {
        responseType: "blob",
      });
      return response.data;
    },
  });
}
