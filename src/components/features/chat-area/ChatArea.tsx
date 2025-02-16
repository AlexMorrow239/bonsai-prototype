import React, { useEffect, useRef } from "react";

import { ChatLoadingIndicator } from "@/components/common/chat-loader/ChatLoader";
import { AIMessage } from "@/components/features/ai-message/AiMessage";
import { UserMessage } from "@/components/features/user-message/UserMessage";

import { useLoadingStore } from "@/stores/loadingStore";
import { Message } from "@/types";

import "./ChatArea.scss";

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps): React.ReactNode {
  const { isLoading } = useLoadingStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="chat-messages">
      {messages.map((message) =>
        message.is_ai_response ? (
          <AIMessage key={message.message_id} message={message} />
        ) : (
          <UserMessage key={message.message_id} message={message} />
        )
      )}
      {isLoading && <ChatLoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
