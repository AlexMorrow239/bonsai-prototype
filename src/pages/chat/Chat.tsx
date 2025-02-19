import React, { useEffect, useRef } from "react";

import { ChatArea } from "@/components/features/chat-area/ChatArea";
import { ChatPrompt } from "@/components/features/chat-prompt/ChatPrompt";
import { FileUpload } from "@/components/features/file-upload/FileUpload";

import { generateGeminiResponse } from "@/services/geminiService";
import { useChatStore } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";
import { useUIStore } from "@/stores/uiStore";
import { Message, UploadedFile } from "@/types";

import "./Chat.scss";

export default function Chat() {
  const { currentChat, addMessage, shouldFocusInput, setShouldFocusInput } =
    useChatStore();
  const { addToast } = useUIStore();
  const { isDragging, setDragging, handleFileDrop } = useFileStore();
  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const dragCounter = useRef(0);

  const handleMessageSubmit = async (
    message: string,
    files?: UploadedFile[]
  ) => {
    if (!currentChat) return;

    const hasContent = message.trim().length > 0 || (files && files.length > 0);
    if (!hasContent) return;

    const newMessageId =
      Math.max(0, ...currentChat.messages.map((m) => m.message_id)) + 1;

    const userMessage: Message = {
      message_id: newMessageId,
      content: message.trim(),
      created_at: new Date().toISOString(),
      is_ai_response: false,
      files,
    };

    addMessage(currentChat.chatInfo.chat_id, userMessage);

    const { setResponseLoading } = useChatStore.getState();

    try {
      setResponseLoading(true);

      // Generate AI response with files
      const aiContent = await generateGeminiResponse(message.trim(), files);

      const aiResponse: Message = {
        message_id: newMessageId + 1,
        content: aiContent,
        created_at: new Date().toISOString(),
        is_ai_response: true,
      };

      addMessage(currentChat.chatInfo.chat_id, aiResponse);
    } catch (error) {
      addToast({
        type: "error",
        message: "Failed to generate AI response",
      });
    } finally {
      setResponseLoading(false);
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

    if (!currentChat) return;

    await handleFileDrop(currentChat.chatInfo.chat_id, e.dataTransfer);
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
          <ChatArea messages={currentChat.messages} />
          <ChatPrompt
            chatId={currentChat.chatInfo.chat_id}
            onSubmit={handleMessageSubmit}
            textareaRef={textareaRef}
          />
          <FileUpload
            chatId={currentChat.chatInfo.chat_id}
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
