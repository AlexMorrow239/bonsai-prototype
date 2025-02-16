import type { ReactNode } from "react";

import { MessageFiles } from "@/components/features/message-files/MessageFiles";

import { Message } from "@/types";

import "./UserMessage.scss";

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps): ReactNode {
  return (
    <div className="message user">
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
