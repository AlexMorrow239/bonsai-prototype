import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { MessageFiles } from "@/components/chat/chat-area/message-files/MessageFiles";

import { useSendMessage } from "@/hooks/api/useMessages";
import type { Message } from "@/types";

import "./UserMessage.scss";

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps): ReactNode {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const sendMessage = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !files.length) return;

    try {
      await sendMessage.mutateAsync({
        chatId: message.chat_id,
        content: content.trim(),
        files: files.length ? files : undefined,
      });

      // Clear form after successful submission
      setContent("");
      setFiles([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formattedDate = useMemo(() => {
    try {
      // Check if created_at is valid
      const date = message.created_at
        ? new Date(message.created_at)
        : new Date();

      // Verify the date is valid before formatting
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, [message.created_at]);

  return (
    <div className="message user">
      {message.content && (
        <div className="message-content">{message.content}</div>
      )}
      {message.files && message.files.length > 0 && (
        <MessageFiles files={message.files} />
      )}
      <div className="message-timestamp">{formattedDate}</div>
      <form onSubmit={handleSubmit}>{/* Form content */}</form>
    </div>
  );
}
