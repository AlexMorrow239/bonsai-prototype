import { ReactElement, useEffect, useRef } from "react";

import { ChatLoadingIndicator } from "@/components/common/chat-loader/ChatLoader";
import { AIMessage } from "@/components/features/chat-area/ai-message/AiMessage";
import { UserMessage } from "@/components/features/chat-area/user-message/UserMessage";

import { useSendMessage } from "@/hooks/api/useMessages";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import type { Message } from "@/types";

import "./ChatArea.scss";

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatArea({ messages, isLoading }: ChatAreaProps): ReactElement {
  const { currentChat } = useChatStore();
  const { getMessagesByChatId } = useMessageStore();
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get messages from store for the current chat
  const chatMessages = currentChat?._id
    ? getMessagesByChatId(currentChat._id)
    : [];

  // Ensure messages is an array before spreading
  const serverMessages = Array.isArray(messages) ? messages : [];

  // Combine and deduplicate messages
  const allMessages = [
    ...serverMessages,
    ...chatMessages.filter(
      (msg) => !serverMessages.find((m) => m._id === msg._id)
    ),
  ];

  // Sort messages by creation date
  const sortedMessages = allMessages.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Scroll to bottom when messages change or during AI response
  useEffect(() => {
    scrollToBottom();
  }, [sortedMessages, sendMessage.isPending]);

  if (isLoading) {
    return <ChatLoadingIndicator message="Loading messages..." />;
  }

  return (
    <div className="chat-messages">
      {sortedMessages.map((message) =>
        message.is_ai_response ? (
          <AIMessage key={`ai-${message._id}`} message={message} />
        ) : (
          <UserMessage key={`user-${message._id}`} message={message} />
        )
      )}
      {sendMessage.isPending && <ChatLoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
