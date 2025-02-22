import React, { ReactElement, useEffect, useRef } from "react";

import { ChatArea } from "@/components/features/chat-area/ChatArea";
import { ChatPrompt } from "@/components/features/chat-prompt/ChatPrompt";
import { FileUpload } from "@/components/features/file-upload/FileUpload";

import { useMessages, useSendMessage } from "@/hooks/api/useMessages";
import { generateGeminiResponse } from "@/services/geminiService";
import { useChatStore } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";
import { useMessageStore } from "@/stores/messageStore";
import { useToastActions } from "@/stores/uiStore";
import type { UploadedFile } from "@/types";

import "./Chat.scss";

export default function Chat(): ReactElement {
  const {
    currentChat,
    shouldFocusInput,
    setShouldFocusInput,
    updateChatPreview,
  } = useChatStore();
  const { isDragging, setDragging, handleFileDrop } = useFileStore();
  const { addMessage } = useMessageStore();
  const { showErrorToast } = useToastActions();

  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const dragCounter = useRef(0);

  // Fetch messages for current chat
  const { data: messages = [], isLoading } = useMessages(
    currentChat?._id || ""
  );
  const sendMessage = useSendMessage();

  const handleMessageSubmit = async (
    content: string,
    files?: UploadedFile[]
  ) => {
    if (!currentChat?._id) {
      showErrorToast(
        new Error("No chat selected"),
        "Please select or create a chat first"
      );
      return;
    }

    const hasContent = content.trim().length > 0 || (files && files.length > 0);
    if (!hasContent) return;

    try {
      // Send user message
      const userMessage = await sendMessage.mutateAsync({
        chatId: currentChat._id,
        content: content.trim(),
        files: files?.map((f) => f.file),
        is_ai_response: false,
      });

      // Validate user message was created successfully
      if (!userMessage) {
        throw new Error("Failed to create user message");
      }

      addMessage(currentChat._id, userMessage);
      updateChatPreview(currentChat._id, userMessage);

      try {
        // Generate AI response
        const aiContent = await generateGeminiResponse(content.trim(), files);

        if (!aiContent) {
          throw new Error("Empty response from AI");
        }

        // Send AI response to backend
        const aiMessage = await sendMessage.mutateAsync({
          chatId: currentChat._id,
          content: aiContent,
          is_ai_response: true,
        });

        // Add AI response to local state and update chat preview
        addMessage(currentChat._id, aiMessage);
        updateChatPreview(currentChat._id, aiMessage);
      } catch (aiError) {
        console.error("[Chat] AI response error:", aiError);
        showErrorToast(aiError, "Failed to generate AI response");
      }
    } catch (error) {
      console.error("[Chat] Message submission error:", error);
      showErrorToast(error, "Failed to send message");
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
          <ChatArea messages={messages || []} isLoading={isLoading} />
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
