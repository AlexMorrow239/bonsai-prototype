import { ReactElement, useEffect, useRef } from "react";

import { Navigate, useParams } from "react-router-dom";

import { useDropzone } from "react-dropzone";

import { ChatArea } from "@/components/chat/chat-area/ChatArea";
import { ChatFileUpload } from "@/components/chat/chat-file-upload/ChatFileUpload";
import { ChatPrompt } from "@/components/chat/chat-prompt/ChatPrompt";

import { FILE_CONSTRAINTS } from "@/common/constants";

import { useGetChat } from "@/hooks/api/useChats";
import { useSendMessage } from "@/hooks/api/useMessages";
import { simulateAIResponse } from "@/services/aiService";
import { useChatStore } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";
import { useMessageStore } from "@/stores/messageStore";
import { useToastActions } from "@/stores/uiStore";
import type { UploadedFile } from "@/types";
import { createFileEntry } from "@/utils/fileUtils";

import "./CurrentChat.scss";

export default function CurrentChat(): ReactElement {
  const { chatId } = useParams();
  const {
    currentChat,
    chats,
    shouldFocusInput,
    setShouldFocusInput,
    updateChatPreview,
    setCurrentChat,
    removeMessage: removeChatMessage,
  } = useChatStore();
  const { isDragging, setDragging, addPendingFiles } = useFileStore();
  const { addMessage, removeMessage: removeStoreMessage } = useMessageStore();
  const { showErrorToast } = useToastActions();

  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const dragCounter = useRef(0);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const sendMessage = useSendMessage();
  const { data: chat, isLoading: isChatLoading } = useGetChat(chatId || "");

  // Update current chat when needed
  useEffect(() => {
    if (!chatId) return;

    if (chat) {
      // If we have the chat data, make sure currentChat matches
      if (currentChat?._id !== chat._id) {
        console.warn("Chat synchronization issue detected - fixing...");
        setCurrentChat(chat);
      }
    } else if (!currentChat || currentChat._id !== chatId) {
      // If we don't have chat data yet but have chatId, fetch it first
      const chatFromStore = chats.find((c) => c._id === chatId);
      if (chatFromStore) {
        setCurrentChat(chatFromStore);
      }
    }
  }, [chatId, chat, currentChat, chats, setCurrentChat]);

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

    // Move tempMessageId declaration outside try block so it's accessible in catch
    const tempMessageId = `temp-${Date.now()}`;

    try {
      // Add message to local store first with temporary ID
      const pendingMessage = {
        _id: tempMessageId,
        chat_id: currentChat._id,
        content: content.trim(),
        files: files,
        is_ai_response: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addMessage(currentChat._id, pendingMessage);
      updateChatPreview(currentChat._id, pendingMessage);

      // Send user message
      const userMessage = await sendMessage.mutateAsync({
        chatId: currentChat._id,
        content: content.trim(),
        files: files
          ? files?.map((f) => f.file).filter((f): f is File => !!f)
          : [],
        is_ai_response: false,
      });

      // Remove temporary message from both stores
      if (userMessage) {
        removeChatMessage(currentChat._id, tempMessageId);
        removeStoreMessage(currentChat._id, tempMessageId);
        addMessage(currentChat._id, userMessage);
        updateChatPreview(currentChat._id, userMessage);
      }

      try {
        // Replace Gemini response generation with simulated response
        const aiContent = await simulateAIResponse(content.trim());

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
      // Clean up the temporary message on error
      removeChatMessage(currentChat._id, tempMessageId);
      removeStoreMessage(currentChat._id, tempMessageId);
    }
  };

  const handleFilesSelected = async (acceptedFiles: File[]) => {
    try {
      if (!currentChat?._id) {
        showErrorToast(
          new Error("No chat selected"),
          "Please select or create a chat first"
        );
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      // Create UploadedFile objects for each selected file
      const uploadedFiles = acceptedFiles.map((file) => createFileEntry(file));

      // Add files to store
      await addPendingFiles(currentChat._id, uploadedFiles);
    } catch (error) {
      console.error("[Chat] File upload error:", error);
      showErrorToast(error, "Failed to process files");
    } finally {
      setDragging(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFilesSelected,
    maxFiles: FILE_CONSTRAINTS.MAX_FILES,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
    },
    noClick: true,
    preventDropOnDocument: true,
    onDragEnter: (event) => {
      event.preventDefault();
      dragCounter.current++;
      if (dragCounter.current === 1) {
        setDragging(true);
      }
    },
    onDragLeave: (event) => {
      event.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setDragging(false);
      }
    },
    onDropAccepted: () => {
      dragCounter.current = 0;
      setDragging(false);
    },
    onDropRejected: (fileRejections) => {
      dragCounter.current = 0;
      setDragging(false);
      showErrorToast(
        new Error(fileRejections[0]?.errors[0]?.message || "Invalid file type"),
        "File upload rejected"
      );
    },
  });

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

  if (!chatId) {
    return <Navigate to="/chat/new" replace />;
  }

  if (isChatLoading) {
    return <div>Loading chat...</div>;
  }

  if (!chat) {
    return <Navigate to="/chat/new" replace />;
  }

  return (
    <main
      className={`chat-main ${isDragging ? "is-dragging" : ""}`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <ChatArea />
      <ChatPrompt onSubmit={handleMessageSubmit} textareaRef={textareaRef} />
      <div ref={dropzoneRef}>
        <ChatFileUpload
          chatId={chat._id}
          variant="dropzone"
          isVisible={isDragging}
        />
      </div>
    </main>
  );
}
