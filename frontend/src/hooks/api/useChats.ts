import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type { ApiError, ApiResponse, Chat } from "@/types";

export function useChats() {
  return useQuery<Chat[], AxiosError<ApiError>>({
    queryKey: ["chats", "list"],
    queryFn: async () => {
      const response = await apiClient.get<{
        data: Chat[];
        metadata: any;
        timestamp: string;
      }>(`/chats`);

      // Extract just the chats array
      return response.data.data || [];
    },
    retry: false,
    staleTime: 1000,
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
