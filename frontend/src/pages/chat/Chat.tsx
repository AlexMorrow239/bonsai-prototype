import React, { useEffect, useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ChatArea } from "@/components/features/chat-area/ChatArea";
import { ChatPrompt } from "@/components/features/chat-prompt/ChatPrompt";
import { FileUpload } from "@/components/features/file-upload/FileUpload";

import { apiClient } from "@/lib/api-client";
import { generateGeminiResponse } from "@/services/geminiService";
import { useChatStore } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";
import { useUIStore } from "@/stores/uiStore";
import type { Message, UploadedFile } from "@/types";

import "./Chat.scss";

export default function Chat() {
  const { currentChat, addMessage, shouldFocusInput, setShouldFocusInput } =
    useChatStore();
  const { addToast } = useUIStore();
  const { isDragging, setDragging, handleFileDrop } = useFileStore();
  const queryClient = useQueryClient();

  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const dragCounter = useRef(0);

  // Use React Query mutation
  const { mutateAsync: sendMessage, isPending: isResponseLoading } =
    useMutation({
      mutationFn: async ({
        chatId,
        content,
        files,
        is_ai_response = false,
      }: {
        chatId: string;
        content: string;
        files?: File[];
        is_ai_response?: boolean;
      }) => {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("is_ai_response", String(is_ai_response));

        if (files?.length) {
          files.forEach((file) => {
            formData.append("files", file);
          });
        }

        const response = await apiClient.post<{ data: Message }>(
          `/chats/${chatId}/messages`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["messages", currentChat?._id],
        });
      },
    });

  const handleMessageSubmit = async (
    message: string,
    files?: UploadedFile[]
  ) => {
    if (!currentChat?._id) return;

    const hasContent = message.trim().length > 0 || (files && files.length > 0);
    if (!hasContent) return;

    try {
      // Send user message
      const userMessage = await sendMessage({
        chatId: currentChat._id,
        content: message.trim(),
        files: files?.map((f) => f.file),
      });

      addMessage(currentChat._id, userMessage);

      // Generate and send AI response
      const aiContent = await generateGeminiResponse(message.trim(), files);

      const aiResponse = await sendMessage({
        chatId: currentChat._id,
        content: aiContent,
        is_ai_response: true,
      });

      addMessage(currentChat._id, aiResponse);
    } catch (error) {
      addToast({
        type: "error",
        message: "Failed to send message or generate AI response",
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current++;

    if (dragCounter.current === 1) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current--;

    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current = 0;
    setDragging(false);

    if (!currentChat?._id) return;

    await handleFileDrop(currentChat._id, e.dataTransfer);
  };

  useEffect(() => {
    if (shouldFocusInput && textareaRef.current) {
      textareaRef.current.focus();
      setShouldFocusInput(false);
    }
  }, [shouldFocusInput, setShouldFocusInput]);

  useEffect(() => {
    // Reset drag counter when component unmounts
    return () => {
      dragCounter.current = 0;
      setDragging(false);
    };
  }, [setDragging]);

  return (
    <main
      className={`chat-main ${isDragging ? "is-dragging" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {currentChat ? (
        <>
          <ChatArea messages={[]} />
          <ChatPrompt
            chatId={currentChat._id}
            onSubmit={handleMessageSubmit}
            textareaRef={textareaRef}
          />
          <FileUpload
            chatId={currentChat._id}
            variant="dropzone"
            isVisible={isDragging}
          />
        </>
      ) : (
        <div className="no-chat-selected">
          <h2>Select a chat to start messaging</h2>
        </div>
      )}
    </main>
  );
}
