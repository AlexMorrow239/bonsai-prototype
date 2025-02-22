import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type { ApiError, ApiResponse, Message } from "@/types/api";

export function useMessages(chatId: string) {
  return useQuery<Message[], AxiosError<ApiError>>({
    queryKey: ["messages", "list", chatId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Message[]>>(
        `/chats/${chatId}/messages`
      );
      return data.data;
    },
    enabled: !!chatId,
  });
}

interface SendMessageData {
  chatId: string;
  content: string;
  is_ai_response?: boolean;
  files?: File[];
}

export function useSendMessage() {
  return useMutation<Message, AxiosError<ApiError>, SendMessageData>({
    mutationFn: async ({ chatId, content, is_ai_response = false, files }) => {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("is_ai_response", String(is_ai_response));

      if (files?.length) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const { data } = await apiClient.post<ApiResponse<Message>>(
        `/chats/${chatId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data.data;
    },
  });
}
