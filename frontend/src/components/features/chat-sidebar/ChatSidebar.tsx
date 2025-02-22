import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/common/button/Button";
import { SidebarSection } from "@/components/common/sidebar-section/SidebarSection";

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

  const handleNewProject = () => {
    navigate("/project/new");
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

  // Transform chats into the format expected by SidebarSection
  const chatItems = sortedChats.map((chat) => ({
    id: chat._id,
    title: chat.title || "Untitled Chat",
  }));

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
        <Button
          variant="secondary"
          size="md"
          className="new-project-btn"
          onClick={handleNewProject}
        >
          New Project
        </Button>
      </div>

      <div className="chat-sidebar__list">
        {isChatsLoading ? (
          <div>Loading chats...</div>
        ) : !Array.isArray(chats) || sortedChats.length === 0 ? (
          <div>No chats available</div>
        ) : (
          <SidebarSection
            title="All Chats"
            items={chatItems}
            isExpanded={showActive}
            onToggleExpand={() => setShowActive(!showActive)}
            currentItemId={currentChat?._id}
            isRenaming={null}
            onItemClick={handleChatClick}
            renderItemContent={(item) => (
              <div className="chat-title">{item.title}</div>
            )}
            disableClickWhenRenaming={false}
          />
        )}
      </div>
    </div>
  );
}
