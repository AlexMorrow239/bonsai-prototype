import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type { ApiError } from "@/types";
import type {
  CreateFolderData,
  FileListResponse,
  FileResponse,
  FileSystemEntity,
  QueryFileParams,
  UpdateFileData,
  UploadFileData,
} from "@/types/filesystem";

// Query files in a folder
export function useFiles(params?: QueryFileParams) {
  return useQuery<FileSystemEntity[], AxiosError<ApiError>>({
    queryKey: ["files", "list", params?.parentFolderId],
    queryFn: async () => {
      const response = await apiClient.get<FileListResponse>("/files", {
        params,
      });
      return response.data.data.data;
    },
  });
}

// Get a single file by ID
export function useFile(fileId: string) {
  return useQuery<FileSystemEntity, AxiosError<ApiError>>({
    queryKey: ["files", fileId],
    queryFn: async () => {
      const response = await apiClient.get<FileResponse>(`/files/${fileId}`);
      return response.data.data.data;
    },
    enabled: !!fileId,
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

      const response = await apiClient.post<FileResponse>(
        "/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data.data;
    },
  });
}

// Create a folder
export function useCreateFolder() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, CreateFolderData>({
    mutationFn: async (folderData) => {
      const response = await apiClient.post<FileResponse>(
        "/files/folders",
        folderData
      );
      return response.data.data.data;
    },
  });
}

// Update a file
export function useUpdateFile() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, UpdateFileData>({
    mutationFn: async ({ _id, ...fileData }) => {
      const response = await apiClient.patch<FileResponse>(
        `/files/${_id}`,
        fileData
      );
      return response.data.data.data;
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
      const response = await apiClient.post<FileResponse>(
        `/files/${fileId}/restore`
      );
      return response.data.data.data;
    },
  });
}

// Toggle star status of a file
export function useToggleFileStar() {
  return useMutation<FileSystemEntity, AxiosError<ApiError>, string>({
    mutationFn: async (fileId) => {
      const response = await apiClient.post<FileResponse>(
        `/files/${fileId}/star`
      );
      return response.data.data.data;
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
