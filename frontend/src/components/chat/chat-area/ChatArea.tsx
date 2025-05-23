import { ReactElement, useEffect, useRef } from "react";

import { AIMessage } from "@/components/chat/chat-area/ai-message/AiMessage";
import { UserMessage } from "@/components/chat/chat-area/user-message/UserMessage";
import { ChatLoader } from "@/components/common/chat-loader/ChatLoader";

import { useMessages } from "@/hooks/api/useMessages";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";

import "./ChatArea.scss";

export function ChatArea(): ReactElement {
  const { currentChat } = useChatStore();
  const { getMessagesByChatId } = useMessageStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = currentChat?._id || "";
  const { messages: serverMessages, isLoading } = useMessages(chatId);

  // Get messages from store for the current chat
  const localMessages = currentChat?._id
    ? getMessagesByChatId(currentChat._id)
    : [];

  // Combine and deduplicate messages, preferring server messages
  const allMessages = [
    ...serverMessages,
    ...localMessages.filter((msg) => {
      // Ensure message has required fields
      if (!msg || !msg.content) {
        console.warn("Filtering out invalid message:", msg);
        return false;
      }

      return !serverMessages.some(
        (m) =>
          // Match by ID if both have valid IDs
          (msg._id && m._id && msg._id === m._id) ||
          // For temp messages, match by content and timestamp
          (msg._id &&
            msg._id.startsWith("temp-") &&
            m.content === msg.content &&
            m.is_ai_response === msg.is_ai_response &&
            Math.abs(
              new Date(m.created_at).getTime() -
                new Date(msg.created_at).getTime()
            ) < 5000)
      );
    }),
  ].filter(Boolean);

  // Sort messages by creation date
  const sortedMessages = allMessages.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change or when loading completes
  useEffect(() => {
    scrollToBottom();
  }, [sortedMessages, isLoading]);

  // If no chat is selected, show a message
  if (!currentChat) {
    return <div className="chat-messages empty">No chat selected</div>;
  }

  // Show loading indicator while messages are being fetched
  if (isLoading) {
    return (
      <div className="chat-messages">
        <ChatLoader message="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="chat-messages">
      {sortedMessages.map((message) =>
        message.is_ai_response ? (
          <AIMessage
            key={`ai-${message._id || `pending-${message.created_at}`}`}
            message={message}
          />
        ) : (
          <UserMessage
            key={`user-${message._id || `pending-${message.created_at}`}`}
            message={message}
          />
        )
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
