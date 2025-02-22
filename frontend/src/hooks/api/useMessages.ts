import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type {
  ApiError,
  ApiResponse,
  Message,
  MessageListResponse,
  MessageResponse,
  SendMessageData,
} from "@/types";

export function useMessages(chatId: string) {
  const query = useQuery<Message[], AxiosError<ApiError>>({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MessageListResponse>>(
        `/chats/${chatId}/messages`
      );
      return response.data.data.data;
    },
    enabled: !!chatId,
    staleTime: 1000,
  });

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<Message, AxiosError<ApiError>, SendMessageData>({
    mutationFn: async ({ chatId, content, is_ai_response = false, files }) => {
      const formData = new FormData();

      const messageData = {
        content,
        is_ai_response,
      };
      formData.append("messageData", JSON.stringify(messageData));

      if (files?.length) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const { data } = await apiClient.post<ApiResponse<MessageResponse>>(
        `/chats/${chatId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the messages query for this chat
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.chatId],
      });
    },
  });
}
