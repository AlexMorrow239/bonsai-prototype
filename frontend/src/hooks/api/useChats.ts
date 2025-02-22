import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type {
  ApiError,
  ApiResponse,
  Chat,
  PaginatedResponse,
} from "@/types/api";

export function useChats(page = 1, limit = 10) {
  return useQuery<PaginatedResponse<Chat>, AxiosError<ApiError>>({
    queryKey: ["chats", page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<
        ApiResponse<PaginatedResponse<Chat>>
      >(`/chats?page=${page}&limit=${limit}`);
      return data.data;
    },
  });
}

interface CreateChatData {
  title: string;
  project_id?: string;
}

interface UpdateChatData {
  id: string;
  title?: string;
  preview?: string;
}

export function useCreateChat() {
  return useMutation<Chat, AxiosError<ApiError>, CreateChatData>({
    mutationFn: async (chatData) => {
      const { data } = await apiClient.post<ApiResponse<Chat>>(
        "/chats",
        chatData
      );
      return data.data;
    },
  });
}

export function useUpdateChat() {
  return useMutation<Chat, AxiosError<ApiError>, UpdateChatData>({
    mutationFn: async ({ id, ...chatData }) => {
      const { data } = await apiClient.patch<ApiResponse<Chat>>(
        `/chats/${id}`,
        chatData
      );
      return data.data;
    },
  });
}

export function useDeleteChat() {
  return useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/chats/${id}`);
    },
  });
}
