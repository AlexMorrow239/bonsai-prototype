import { FormEvent, ReactNode, RefObject, useState } from "react";

import { Send } from "lucide-react";

import { UploadedFiles } from "@/components/chat/chat-prompt/uploaded-files/UploadedFiles";
import { Button } from "@/components/common/button/Button";
import { FileUpload } from "@/components/common/file-upload/FileUpload";

import { useChatStore } from "@/stores/chatStore";
import { useToastActions } from "@/stores/uiStore";
import type { UploadedFile } from "@/types";

import "./ChatPrompt.scss";

interface ChatPromptProps {
  onSubmit: (message: string, files?: UploadedFile[]) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  isNewChat?: boolean;
}

export function ChatPrompt({
  onSubmit,
  textareaRef,
  isNewChat = false,
}: ChatPromptProps): ReactNode {
  const { currentChat, getPendingFiles, clearPendingFiles } = useChatStore();
  const [message, setMessage] = useState("");
  const { showErrorToast } = useToastActions();

  // Get files based on whether we're in a new chat or existing chat
  const files = isNewChat
    ? getPendingFiles(null)
    : currentChat
      ? getPendingFiles(currentChat._id)
      : [];
  const hasContent = message.trim().length > 0 || files.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Allow submission if there are files, even with empty message
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !files.length) return;

    try {
      // For new chats, just pass the message to parent and return early
      if (isNewChat) {
        onSubmit(trimmedMessage, files);
        setMessage("");
        clearPendingFiles(null);

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "44px";
        }
        return;
      }

      // Everything below this point only executes for existing chats
      if (currentChat) {
        clearPendingFiles(currentChat._id);
        onSubmit(trimmedMessage, files);
        setMessage("");

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "44px";
        }
      } else {
        console.warn(
          "[ChatPrompt] No current chat found for existing chat message"
        );
      }
    } catch (error) {
      console.error("[ChatPrompt] Submit error:", error);
      showErrorToast(error, "Failed to send message");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-adjust height
    const textarea = e.target;
    textarea.style.height = "44px"; // Reset height
    const maxHeight = 200;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div
      className={`chat-prompt-wrapper ${files.length > 0 ? "has-files" : ""}`}
    >
      {isNewChat ? (
        <UploadedFiles chatId={null} />
      ) : (
        currentChat && <UploadedFiles chatId={currentChat._id} />
      )}

      <form className="chat-prompt" onSubmit={handleSubmit}>
        <div className="input-row">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
          />
          <div className="actions">
            {isNewChat ? (
              <FileUpload chatId={null} variant="compact" />
            ) : (
              currentChat && (
                <FileUpload chatId={currentChat._id} variant="compact" />
              )
            )}
            <Button
              className="send-button"
              type="submit"
              disabled={!hasContent}
              title="Type a message or upload files to send"
              size="md"
              variant="primary"
              rightIcon={<Send size={18} />}
              fullWidth={true}
            >
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
