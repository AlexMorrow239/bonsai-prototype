import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type { ApiError, ApiResponse, Message } from "@/types";

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Message[], AxiosError<ApiError>>({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Message[]>>(
        `/chats/${chatId}/messages`
      );
      return data.data;
    },
    enabled: !!chatId,
  });

  const createMessage = useMutation({
    mutationFn: async (data: { content: string; files?: File[] }) => {
      const formData = new FormData();

      // Add the message content
      formData.append("content", data.content);

      // Add any files if they exist
      if (data.files?.length) {
        data.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await axios.post<Message>(`/api/messages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch messages query
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    createMessage,
  };
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
      // Create FormData
      const formData = new FormData();

      // Create messageData object and stringify it
      const messageData = {
        content,
        is_ai_response,
      };
      formData.append("messageData", JSON.stringify(messageData));

      // Add files if they exist
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
