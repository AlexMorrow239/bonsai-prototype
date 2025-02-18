import React from "react";

import { Button } from "@/components/common/button/Button";

import "./ChatSection.scss";

interface Chat {
  chat_id: number;
  title: string;
  is_active?: boolean;
}

interface ChatSectionProps {
  title: string;
  chats: Chat[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentChatId?: number;
  isRenamingChat: number | null;
  onChatSelect: (chatId: number) => void;
  renderChatTitle: (chat: { chatInfo: Chat }) => React.ReactNode;
  isArchived?: boolean;
}

export function ChatSection({
  title,
  chats,
  isExpanded,
  onToggleExpand,
  currentChatId,
  isRenamingChat,
  onChatSelect,
  renderChatTitle,
  isArchived = false,
}: ChatSectionProps) {
  if (chats.length === 0) return null;

  return (
    <>
      <div
        className={`list-header ${isArchived ? "archived" : ""}`}
        onClick={onToggleExpand}
      >
        <h3>{title}</h3>
        <span className="toggle">{isExpanded ? "−" : "+"}</span>
      </div>
      {isExpanded &&
        chats.map((chat) => (
          <Button
            key={chat.chat_id}
            variant="ghost"
            className={`chat-item ${isArchived ? "archived" : ""} ${
              currentChatId === chat.chat_id ? "active" : ""
            }`}
            onClick={() => (isRenamingChat ? null : onChatSelect(chat.chat_id))}
          >
            {renderChatTitle({ chatInfo: chat })}
          </Button>
        ))}
    </>
  );
}
