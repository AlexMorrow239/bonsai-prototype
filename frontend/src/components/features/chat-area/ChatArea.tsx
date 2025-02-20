import React, { useEffect, useRef } from "react";

import { ChatLoadingIndicator } from "@/components/common/chat-loader/ChatLoader";
import { AIMessage } from "@/components/features/chat-area/ai-message/AiMessage";
import { UserMessage } from "@/components/features/chat-area/user-message/UserMessage";

import { useChatStore } from "@/stores/chatStore";
import { Message } from "@/types";

import "./ChatArea.scss";

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps): React.ReactNode {
  const { isResponseLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResponseLoading]);

  return (
    <div className="chat-messages">
      {messages.map((message, index) =>
        message.is_ai_response ? (
          <AIMessage
            key={`ai-${message.message_id || index}`}
            message={message}
            index={index}
          />
        ) : (
          <UserMessage
            key={`user-${message.message_id || index}`}
            message={message}
          />
        )
      )}
      {isResponseLoading && <ChatLoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
