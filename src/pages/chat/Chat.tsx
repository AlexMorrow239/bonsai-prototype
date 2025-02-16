import React, { useEffect, useRef } from "react";

import { ChatArea } from "@/components/features/chat-area/ChatArea";
import { ChatPrompt } from "@/components/features/chat-prompt/ChatPrompt";
import { FileUpload } from "@/components/features/file-upload/FileUpload";

import { useChatStore } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";

import "./Chat.scss";

export default function Chat() {
  const { currentChat, addMessage, shouldFocusInput, setShouldFocusInput } =
    useChatStore();
  const { isDragging, setDragging, handleFileDrop } = useFileStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragCounter = useRef(0);

  const handleMessageSubmit = (message: string) => {
    if (!message.trim() || !currentChat) return;

    // Add user message
    addMessage(currentChat.chatInfo.chat_id, {
      content: message.trim(),
      created_at: new Date().toISOString(),
      is_ai_response: false,
    });

    // Simulate AI response
    setTimeout(() => {
      addMessage(currentChat.chatInfo.chat_id, {
        content:
          "This is a simulated AI response. The actual AI integration will be implemented later.",
        created_at: new Date().toISOString(),
        is_ai_response: true,
      });
    }, 1000);
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
