import React from "react";

import { Message } from "@/types";

import "./ChatArea.scss";

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps): React.ReactNode {
  return (
    <div className="chat-messages">
      {messages.map((msg) => (
        <div
          key={msg.message_id}
          className={`message ${msg.is_ai_response ? "ai" : "user"}`}
        >
          <div className="message-content">{msg.content}</div>
          <div className="message-timestamp">
            {new Date(msg.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}
