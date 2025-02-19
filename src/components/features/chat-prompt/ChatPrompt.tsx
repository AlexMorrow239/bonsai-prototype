import { FormEvent, ReactNode, RefObject, useState } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { UploadedFiles } from "@/components/features/chat-prompt/uploaded-files/UploadedFiles";
import { FileUpload } from "@/components/features/file-upload/FileUpload";

import { useFileStore } from "@/stores/fileStore";
import { UploadedFile } from "@/types";

import "./ChatPrompt.scss";

interface ChatPromptProps {
  chatId: number;
  onSubmit: (message: string, files?: UploadedFile[]) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
}

export function ChatPrompt({
  chatId,
  onSubmit,
  textareaRef,
}: ChatPromptProps): ReactNode {
  const [message, setMessage] = useState("");
  const { getFilesByChatId, clearFiles } = useFileStore();
  const files = getFilesByChatId(chatId);
  const hasContent = message.trim().length > 0 || files.length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!hasContent) return;

    onSubmit(trimmedMessage, files.length > 0 ? files : undefined);
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
      <UploadedFiles chatId={chatId} />

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
