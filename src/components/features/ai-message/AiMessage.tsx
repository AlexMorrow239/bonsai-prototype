import type { ReactNode } from "react";

import { Bot } from "lucide-react";

import { MessageFiles } from "@/components/features/message-files/MessageFiles";

import { Message } from "@/types";

import "./AiMessage.scss";

interface AIMessageProps {
  message: Message;
}

export function AIMessage({ message }: AIMessageProps): ReactNode {
  return (
    <div className="message ai">
      <Bot className="message-icon" size={16} />
      {message.content && (
        <div className="message-content">{message.content}</div>
      )}
      {message.files && <MessageFiles files={message.files} />}
      <div className="message-timestamp">
        {new Date(message.created_at).toLocaleTimeString()}
      </div>
    </div>
  );
}
