import type { ReactNode } from "react";
import { useMemo } from "react";

import { Bot } from "lucide-react";

import type { Message } from "@/types";

import "./AiMessage.scss";

interface AIMessageProps {
  message: Message;
}

export function AIMessage({ message }: AIMessageProps): ReactNode {
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
    <div key={message._id} className="message ai">
      <Bot className="message-icon" size={16} />
      {message.content && (
        <div className="message-content">{message.content}</div>
      )}
      <div className="message-timestamp">{formattedDate}</div>
    </div>
  );
}
