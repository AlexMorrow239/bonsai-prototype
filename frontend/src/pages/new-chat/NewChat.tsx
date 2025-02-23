import { ReactElement, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { useDropzone } from "react-dropzone";

import { ChatPrompt } from "@/components/features/chat-prompt/ChatPrompt";
import { FileUpload } from "@/components/features/file-upload/FileUpload";

import { FILE_CONSTRAINTS } from "@/common/constants";

import { useCreateChat } from "@/hooks/api/useChats";
import { useSendMessage } from "@/hooks/api/useMessages";
import { simulateAIResponse } from "@/services/aiService";
import { useChatStore } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";
import { useMessageStore } from "@/stores/messageStore";
import { useToastActions } from "@/stores/uiStore";
import type { Message, UploadedFile } from "@/types";
import { createFileEntry } from "@/utils/fileUtils";

import "./NewChat.scss";

export function NewChat(): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  const { showErrorToast } = useToastActions();
  const { addMessage, removeMessage: removeStoreMessage } = useMessageStore();
  const { isDragging, setDragging, addPendingFiles } = useFileStore();
  const {
    setCurrentChat,
    setChats,
    chats,
    removeMessage: removeChatMessage,
  } = useChatStore();
  const navigate = useNavigate();

  const createChat = useCreateChat();
  const sendMessage = useSendMessage();

  const handleFilesSelected = async (acceptedFiles: File[]) => {
    try {
      if (acceptedFiles.length === 0) {
        return;
      }

      // Create UploadedFile objects for each selected file
      const uploadedFiles = acceptedFiles.map((file) =>
        createFileEntry(file, null)
      );

      // Add files to store without a chat ID
      await addPendingFiles(null, uploadedFiles);
    } catch (error) {
      console.error("[NewChat] File upload error:", error);
      showErrorToast(error, "Failed to process files");
    } finally {
      setDragging(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      dragCounter.current = 0;
      setDragging(false);
      handleFilesSelected(acceptedFiles);
    },
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
      event.stopPropagation();

      // Only count drag events from the window or document
      if (event.target === document || event.target === window) {
        dragCounter.current = 1;
      } else {
        dragCounter.current++;
      }

      if (dragCounter.current === 1) {
        setDragging(true);
      }
    },
    onDragLeave: (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Only decrement for non-window/document events
      if (event.target !== document && event.target !== window) {
        dragCounter.current--;
      }

      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
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

  // Add window-level drag event cleanup
  useEffect(() => {
    const handleWindowDragLeave = (event: DragEvent) => {
      // Check if dragging has left the window
      if (
        event.clientX <= 0 ||
        event.clientY <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      ) {
        dragCounter.current = 0;
        setDragging(false);
      }
    };

    window.addEventListener("dragleave", handleWindowDragLeave);
    return () => {
      window.removeEventListener("dragleave", handleWindowDragLeave);
      // Reset state on unmount
      dragCounter.current = 0;
      setDragging(false);
    };
  }, [setDragging]);

  const handleFirstMessage = async (
    content: string,
    files?: UploadedFile[]
  ) => {
    const hasContent = content.trim().length > 0 || (files && files.length > 0);
    if (!hasContent) return;

    const tempMessageId = `temp-${Date.now()}`;
    let newChat;

    try {
      // Create chat title from content or first file name
      const title =
        content.trim() || (files && files[0]?.metadata.name) || "New Chat";

      // Create new chat first
      newChat = await createChat.mutateAsync({
        title: title.slice(0, 50),
        is_active: true,
      });

      if (!newChat) {
        throw new Error("Failed to create chat");
      }

      // Add message to local store first with temporary ID
      const pendingMessage: Message = {
        _id: tempMessageId,
        chat_id: newChat._id,
        content: content.trim(),
        files: files,
        is_ai_response: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update stores with new chat and pending message
      setChats([...chats, newChat]);
      addMessage(newChat._id, pendingMessage);
      setCurrentChat(newChat);

      // Send user message
      const userMessage = await sendMessage.mutateAsync({
        chatId: newChat._id,
        content: content.trim(),
        files: files
          ? files?.map((f) => f.file).filter((f): f is File => !!f)
          : [],
        is_ai_response: false,
      });

      // Remove temporary message and add server response
      if (userMessage) {
        removeChatMessage(newChat._id, tempMessageId);
        removeStoreMessage(newChat._id, tempMessageId);
        addMessage(newChat._id, userMessage);
      }

      try {
        // Replace Gemini response generation with simulated response
        const aiContent = await simulateAIResponse(content.trim());

        if (!aiContent) {
          throw new Error("Empty response from AI");
        }

        // Send AI response to backend
        const aiMessage = await sendMessage.mutateAsync({
          chatId: newChat._id,
          content: aiContent,
          is_ai_response: true,
        });

        // Add AI response to local state
        addMessage(newChat._id, aiMessage);
      } catch (aiError) {
        console.error("[NewChat] AI response error:", aiError);
        showErrorToast(aiError, "Failed to generate AI response");
      }

      // Navigate to chat view after everything is done
      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error("[NewChat] Creation error:", error);
      showErrorToast(error, "Failed to create chat");
      // If we have a newChat._id, clean up the temporary message
      if (newChat?._id) {
        removeChatMessage(newChat._id, tempMessageId);
        removeStoreMessage(newChat._id, tempMessageId);
      }
    }
  };

  return (
    <main
      className={`new-chat ${isDragging ? "is-dragging" : ""}`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="new-chat__content">
        <h1>Start a New Chat</h1>
        <p>Type your message to begin a new conversation</p>
      </div>
      <ChatPrompt
        onSubmit={handleFirstMessage}
        textareaRef={textareaRef}
        isNewChat={true}
      />
      <div ref={dropzoneRef} className="file-upload-overlay">
        <FileUpload
          chatId={`temp-${Date.now()}`}
          variant="dropzone"
          isVisible={isDragging}
        />
      </div>
    </main>
  );
}
