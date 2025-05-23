import { ReactElement, useEffect, useRef, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { useDropzone } from "react-dropzone";

import { ChatPrompt } from "@/components/chat/chat-prompt/ChatPrompt";
import { FileUpload } from "@/components/common/file-upload/FileUpload";

import { FILE_CONSTRAINTS } from "@/common/constants";

import { useCreateChat } from "@/hooks/api/useChats";
import { useSendMessage } from "@/hooks/api/useMessages";
import { useGetProject } from "@/hooks/api/useProjects";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";
import type { Message, UploadedFile } from "@/types";
import { createFileEntry } from "@/utils/fileUtils";

import "./NewChat.scss";

export function NewChat(): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  const [chatCreated, setChatCreated] = useState(false);
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");

  const { showErrorToast } = useToastActions();
  const { addMessage, removeMessage: removeStoreMessage } = useMessageStore();
  const { isDragging, setDragging, addPendingFiles } = useChatStore();
  const {
    setCurrentChat,
    setChats,
    chats,
    removeMessage: removeChatMessage,
  } = useChatStore();
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const clearCurrentProject = useProjectStore(
    (state) => state.clearCurrentProject
  );
  const navigate = useNavigate();

  const createChat = useCreateChat();
  const sendMessage = useSendMessage();

  // Fetch project data if we have a project ID from the URL
  const { data: projectFromUrl } = useGetProject(projectIdFromUrl || "");

  // Set the current project from URL if available
  useEffect(() => {
    if (projectIdFromUrl) {
      if (projectFromUrl) {
        setCurrentProject(projectFromUrl);
      }
    } else if (!currentProject) {
      // If no project ID in URL and no current project, make sure it's cleared
      clearCurrentProject();
    }
  }, [
    projectFromUrl,
    projectIdFromUrl,
    currentProject,
    setCurrentProject,
    clearCurrentProject,
  ]);

  const handleFilesSelected = async (acceptedFiles: File[]) => {
    try {
      if (acceptedFiles.length === 0) {
        return;
      }

      // Create UploadedFile objects for each selected file
      const uploadedFiles = acceptedFiles.map((file) => createFileEntry(file));

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

  // Clear current project when component unmounts, but only if no chat was created
  useEffect(() => {
    return () => {
      if (!chatCreated) {
        clearCurrentProject();
      }
    };
  }, [chatCreated, clearCurrentProject]);

  const handleFirstMessage = async (
    content: string,
    files?: UploadedFile[]
  ) => {
    const hasContent = content.trim().length > 0 || (files && files.length > 0);
    if (!hasContent) return;

    const tempMessageId = `temp-${Date.now()}`;
    let newChat;

    try {
      // Create chat title from content or first file name or use project name
      let title =
        content.trim() || (files && files[0]?.metadata.name) || "New Chat";

      // If we have a current project, use its name in the title
      if (currentProject) {
        title = `${currentProject.name} - ${title.slice(0, 30)}`;
      }

      // Create new chat with project association if a current project exists
      const chatData = {
        title: title.slice(0, 50),
        ...(currentProject && { project_id: currentProject._id }),
      };

      // Create new chat first
      newChat = await createChat.mutateAsync(chatData);

      if (!newChat) {
        throw new Error("Failed to create chat");
      }

      // Mark that a chat was created so we don't clear the project context on unmount
      setChatCreated(true);

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
        {projectIdFromUrl && !currentProject ? (
          <div className="new-chat__loading">
            <p>Loading project information...</p>
          </div>
        ) : currentProject ? (
          <div className="new-chat__project-context">
            <p>
              This chat will be associated with project:{" "}
              <strong>{currentProject.name}</strong>
            </p>
          </div>
        ) : (
          <p>Type your message to begin a new conversation</p>
        )}
      </div>
      <ChatPrompt
        onSubmit={handleFirstMessage}
        textareaRef={textareaRef}
        isNewChat={true}
      />
      <div ref={dropzoneRef} className="file-upload-overlay">
        <FileUpload
          variant="dropzone"
          isVisible={isDragging}
          onFilesSelected={async (files) => {
            try {
              await addPendingFiles(null, files);
            } catch (error) {
              showErrorToast(error, "Failed to process files");
            } finally {
              setDragging(false);
            }
          }}
          onError={(error) => showErrorToast(error, "Failed to process files")}
          dropzoneOptions={{
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
                new Error(
                  fileRejections[0]?.errors[0]?.message || "Invalid file type"
                ),
                "File upload rejected"
              );
            },
          }}
        />
      </div>
    </main>
  );
}
