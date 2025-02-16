import { FormEvent, ReactNode, useRef, useState } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { FileUpload } from "@/components/features/file-upload/FileUpload";
import { UploadedFiles } from "@/components/features/uploaded-files/UploadedFiles";

import { useFileStore } from "@/stores/fileStore";
import { UploadedFile } from "@/types";

import "./ChatPrompt.scss";

interface ChatPromptProps {
  chatId: number;
  onSubmit: (message: string, files: UploadedFile[]) => void;
}

export function ChatPrompt({ chatId, onSubmit }: ChatPromptProps): ReactNode {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getFilesByChatId, clearFiles } = useFileStore();
  const files = getFilesByChatId(chatId);
  const hasContent = message.trim().length > 0 || files.length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!hasContent) return;

    onSubmit(trimmedMessage, files);
    setMessage("");
    clearFiles(chatId);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-adjust height
    const textarea = e.target;
    textarea.style.height = "44px"; // Reset height
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div
      className={`chat-prompt-wrapper ${files.length > 0 ? "has-files" : ""}`}
    >
      <UploadedFiles chatId={chatId} />

      <form className="chat-prompt" onSubmit={handleSubmit}>
        <div className="input-row">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            placeholder="Type your message..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="actions">
            <FileUpload chatId={chatId} variant="compact" />
            <Button
              className="send-button"
              type="submit"
              disabled={!hasContent}
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
