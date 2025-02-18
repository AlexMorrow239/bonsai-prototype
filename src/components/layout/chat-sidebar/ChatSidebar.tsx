import React, { useEffect, useRef } from "react";

import { Button } from "@/components/common/button/Button";
import { SidebarSection } from "@/components/common/sidebar-section/SidebarSection";

import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";

import "./ChatSidebar.scss";

export default function ChatSidebar() {
  const {
    currentChat,
    setCurrentChat,
    createNewChat,
    isRenamingChat,
    setIsRenamingChat,
    updateChatTitle,
    getUnassociatedChats,
  } = useChatStore();
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const [showActive, setShowActive] = React.useState(true);
  const [showProjects, setShowProjects] = React.useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenamingChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenamingChat]);

  const handleRename = (
    chat: any,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      updateChatTitle(chat.chatInfo.chat_id, e.currentTarget.value);
      setIsRenamingChat(null);
    } else if (e.key === "Escape") {
      setIsRenamingChat(null);
    }
  };

  const handleBlur = () => {
    setIsRenamingChat(null);
  };

  const renderChatTitle = (chat: any) => {
    if (isRenamingChat === chat.chatInfo.chat_id) {
      return (
        <input
          ref={inputRef}
          className="chat-title-input"
          defaultValue={chat.chatInfo.title}
          onKeyDown={(e) => handleRename(chat, e)}
          onBlur={handleBlur}
        />
      );
    }
    return <div className="chat-title">{chat.chatInfo.title}</div>;
  };

  const handleNewChat = () => {
    if (currentProject) {
      createNewChat("New Chat", currentProject.project_id);
    } else {
      createNewChat("New Chat");
    }
  };

  const renderProjectContent = (project: any) => (
    <div className="project-item-content">
      <span className="project-icon">📁</span>
      <div className="project-title">{project.name}</div>
    </div>
  );

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
        <SidebarSection
          title="Projects"
          items={projects.map((project) => ({
            id: project.project_id,
            title: project.name,
          }))}
          isExpanded={showProjects}
          onToggleExpand={() => setShowProjects(!showProjects)}
          currentItemId={currentProject?.project_id}
          isRenaming={null}
          onItemClick={setCurrentProject}
          renderItemContent={renderProjectContent}
          disableClickWhenRenaming={false}
        />
        <SidebarSection
          title="All Chats"
          items={getUnassociatedChats().map((chat) => ({
            id: chat.chatInfo.chat_id,
            title: chat.chatInfo.title,
          }))}
          isExpanded={showActive}
          onToggleExpand={() => setShowActive(!showActive)}
          currentItemId={currentChat?.chatInfo.chat_id}
          isRenaming={isRenamingChat}
          onItemClick={setCurrentChat}
          renderItemContent={(item) =>
            renderChatTitle({
              chatInfo: { chat_id: item.id, title: item.title },
            })
          }
        />
      </div>
    </div>
  );
}
