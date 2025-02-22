import React, { useEffect, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/common/button/Button";
import { SidebarSection } from "@/components/common/sidebar-section/SidebarSection";

import { useChats, useCreateChat } from "@/hooks/api/useChats";
import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";

import "./ChatSidebar.scss";

export default function ChatSidebar() {
  const navigate = useNavigate();

  const { data: chatsData, isLoading: isChatsLoading } = useChats();

  // Store state
  const { currentChat, setCurrentChat, chats, setChats } = useChatStore();

  const { currentProject } = useProjectStore();
  const { showErrorToast, showSuccessToast } = useToastActions();

  // Update chats when data changes
  useEffect(() => {
    if (chatsData) {
      // This is correct - need both .data properties:
      // First .data is from React Query
      // Second .data is from our API response structure
      setChats(chatsData.data.data);
    }
  }, [chatsData, setChats]);

  // API mutations
  const createChat = useCreateChat();

  const [showActive, setShowActive] = React.useState(true);

  const handleChatClick = (chatId: string) => {
    setCurrentChat(chatId, navigate);
  };

  const renderChatTitle = (chat: { id: string; title: string }) => {
    return <div className="chat-title">{chat.title}</div>;
  };

  const handleNewChat = async () => {
    try {
      await createChat.mutateAsync({
        title: "New Chat",
        project_id: currentProject?._id,
        is_active: true,
      });
      showSuccessToast("New chat created");
    } catch (error) {
      showErrorToast(error, "Failed to create new chat");
    }
  };
  // Transform data for SidebarSection using useMemo
  const chatItems = useMemo(
    () =>
      Array.isArray(chats)
        ? chats.map((chat) => ({
            id: chat._id,
            title: chat.title || "Untitled Chat",
          }))
        : [],
    [chats]
  );

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar__controls">
        <Button
          variant="primary"
          size="md"
          className="new-chat-btn"
          onClick={handleNewChat}
          disabled={createChat.isPending}
        >
          New Chat
        </Button>
      </div>

      <div className="chat-sidebar__list">
        {isChatsLoading ? (
          <div>Loading chats...</div>
        ) : chatItems.length === 0 ? (
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
            renderItemContent={renderChatTitle}
          />
        )}
      </div>
    </div>
  );
}
