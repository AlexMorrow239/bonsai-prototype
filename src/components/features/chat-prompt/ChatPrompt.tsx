import { FormEvent, ReactNode, useRef, useState } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { FileUpload } from "@/components/features/file-upload/FileUpload";
import { UploadedFiles } from "@/components/features/uploaded-files/UploadedFiles";

import { useFileStore } from "@/stores/fileStore";

import "./ChatPrompt.scss";

interface ChatPromptProps {
  chatId: number;
  onSubmit: (message: string) => void;
}

export function ChatPrompt({ chatId, onSubmit }: ChatPromptProps): ReactNode {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getFilesByChatId } = useFileStore();
  const hasFiles = getFilesByChatId(chatId).length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSubmit(trimmedMessage);
    setMessage("");
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-adjust height
    const textarea = e.target;
    textarea.style.height = "44px"; // Reset height
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className={`chat-prompt-wrapper ${hasFiles ? "has-files" : ""}`}>
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
              disabled={!message.trim()}
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
