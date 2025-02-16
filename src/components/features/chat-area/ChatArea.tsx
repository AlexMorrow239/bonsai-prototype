import React, { useEffect, useRef } from "react";

import { ChatLoadingIndicator } from "@/components/common/chat-loader/ChatLoader";
import { AIMessage } from "@/components/features/ai-message/AiMessage";
import { UserMessage } from "@/components/features/user-message/UserMessage";

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
      {messages.map((message) =>
        message.is_ai_response ? (
          <AIMessage key={message.message_id} message={message} />
        ) : (
          <UserMessage key={message.message_id} message={message} />
        )
      )}
      {isResponseLoading && <ChatLoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
