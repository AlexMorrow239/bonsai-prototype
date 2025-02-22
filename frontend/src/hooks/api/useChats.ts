import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type {
  ApiError,
  ApiResponse,
  Chat,
  ChatListResponse,
  ChatResponse,
  NewChat,
  UpdateChat,
} from "@/types";

export function useChats() {
  return useQuery<Chat[], AxiosError<ApiError>>({
    queryKey: ["chats", "list"],
    queryFn: async () => {
      const response =
        await apiClient.get<ApiResponse<ChatListResponse>>("/chats");
      return response.data.data.data;
    },
    retry: false,
    staleTime: 1000,
  });
}

export function useCreateChat() {
  return useMutation<Chat, AxiosError<ApiError>, NewChat>({
    mutationFn: async (chatData) => {
      const response = await apiClient.post<ApiResponse<ChatResponse>>(
        "/chats",
        chatData
      );
      return response.data.data.data;
    },
  });
}

export function useUpdateChat() {
  return useMutation<Chat, AxiosError<ApiError>, UpdateChat>({
    mutationFn: async ({ id, ...chatData }) => {
      const response = await apiClient.patch<ApiResponse<ChatResponse>>(
        `/chats/${id}`,
        chatData
      );
      return response.data.data.data;
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

export function useGetChat(chatId: string) {
  return useQuery<Chat, AxiosError<ApiError>>({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ChatResponse>>(
        `/chats/${chatId}`
      );
      return response.data.data.data;
    },
    enabled: !!chatId,
  });
}
