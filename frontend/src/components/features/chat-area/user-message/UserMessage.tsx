import type { ReactNode } from "react";
import { useState } from "react";

import { MessageFiles } from "@/components/features/chat-area/message-files/MessageFiles";

import { useMessages } from "@/hooks/api/useMessages";
import type { Message } from "@/types";

import "./UserMessage.scss";

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps): ReactNode {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { createMessage } = useMessages(message.chat_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !files.length) return;

    try {
      await createMessage.mutateAsync({
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

  return (
    <div className="message user">
      {message.content && (
        <div className="message-content">{message.content}</div>
      )}
      {message.files && message.files.length > 0 && (
        <MessageFiles files={message.files} />
      )}
      <div className="message-timestamp">{message.created_at}</div>
      <form onSubmit={handleSubmit}>{/* Form content */}</form>
    </div>
  );
}
