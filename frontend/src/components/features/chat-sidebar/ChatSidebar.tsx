import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/common/button/Button";

import { useChats } from "@/hooks/api/useChats";
import { useChatStore } from "@/stores/chatStore";
import type { Chat } from "@/types/chat";

import "./ChatSidebar.scss";

export default function ChatSidebar() {
  const navigate = useNavigate();
  const { data: chatsData, isLoading: isChatsLoading } = useChats();

  // Split store subscriptions to minimize re-renders
  const currentChat = useChatStore((state) => state.currentChat);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);
  const chats = useChatStore((state) => state.chats) as Chat[];
  const setChats = useChatStore((state) => state.setChats);

  const [showActive, setShowActive] = React.useState(true);

  // Update chats when data changes
  useEffect(() => {
    if (chatsData) {
      setChats(chatsData);
    }
  }, [chatsData, setChats]);

  const handleChatClick = (chatId: string) => {
    const chat = (chats || []).find((c) => c._id === chatId);
    if (chat) {
      setCurrentChat(chat);
      navigate(`/chat/${chatId}`);
    }
  };

  const handleNewChat = () => {
    navigate("/chat/new");
  };

  // Sort chats by last_message_at or created_at
  const sortedChats = React.useMemo(() => {
    if (!Array.isArray(chats)) return [];

    return [...chats].sort((a, b) => {
      const aDate = a.last_message_at || a.created_at;
      const bDate = b.last_message_at || b.created_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [chats]);

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar__controls">
        <Button
          variant="primary"
          size="md"
          className="new-chat-btn"
          onClick={handleNewChat}
        >
          New Chat
        </Button>
      </div>

      <div className="chat-sidebar__list">
        {isChatsLoading ? (
          <div>Loading chats...</div>
        ) : !Array.isArray(chats) || sortedChats.length === 0 ? (
          <div>No chats available</div>
        ) : (
          <>
            <div
              className="list-header"
              onClick={() => setShowActive(!showActive)}
            >
              <h3>All Chats</h3>
              <span className="toggle">{showActive ? "-" : "+"}</span>
            </div>

            {showActive &&
              sortedChats.map((chat) => (
                <Button
                  key={chat._id}
                  variant="ghost"
                  className={`chat-item ${
                    currentChat?._id === chat._id ? "active" : ""
                  }`}
                  onClick={() => handleChatClick(chat._id)}
                >
                  <div className="chat-title">
                    {chat.title || "Untitled Chat"}
                  </div>
                </Button>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
