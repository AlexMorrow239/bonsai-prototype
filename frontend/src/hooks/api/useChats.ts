import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type { ApiError, ApiResponse, Chat, NewChat, UpdateChat } from "@/types";

interface ChatsResponse {
  data: Chat[];
  metadata: {
    path: string;
  };
  timestamp: string;
}

export function useChats() {
  return useQuery<ApiResponse<ChatsResponse>, AxiosError<ApiError>>({
    queryKey: ["chats", "list"],
    queryFn: async () => {
      const response =
        await apiClient.get<ApiResponse<ChatsResponse>>(`/chats`);
      return response.data;
    },
    retry: false,
    staleTime: 1000,
  });
}

export function useCreateChat() {
  return useMutation<Chat, AxiosError<ApiError>, NewChat>({
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
  return useMutation<Chat, AxiosError<ApiError>, UpdateChat>({
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
