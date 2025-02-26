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
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(message.created_at));
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
