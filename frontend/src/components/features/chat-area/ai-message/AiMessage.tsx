import type { ReactNode } from "react";

import { Bot } from "lucide-react";

import { MessageFiles } from "@/components/features/chat-area/message-files/MessageFiles";

import type { Message } from "@/types";

import "./AiMessage.scss";

interface AIMessageProps {
  message: Message;
}

export function AIMessage({ message }: AIMessageProps): ReactNode {
  return (
    <div key={message._id} className="message ai">
      <Bot className="message-icon" size={16} />
      {message.content && (
        <div className="message-content">{message.content}</div>
      )}
      {message.files && message.files.length > 0 && (
        <MessageFiles files={message.files} />
      )}
      <div className="message-timestamp">{message.created_at}</div>
    </div>
  );
}
