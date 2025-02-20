import React, { useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { Folder } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { SidebarSection } from "@/components/common/sidebar-section/SidebarSection";

import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import { Chat, ChatInfo } from "@/types";

import "./ChatSidebar.scss";

export default function ChatSidebar() {
  const navigate = useNavigate();
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

  const handleChatClick = (chatId: number) => {
    setCurrentChat(chatId, navigate);
  };

  const handleProjectClick = (projectId: number) => {
    setCurrentProject(projectId);
    navigate(`/project/${projectId}`);
  };

  const handleRename = (
    chat: Chat,
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

  const renderChatTitle = (chatInfo: ChatInfo) => {
    if (isRenamingChat === chatInfo.chat_id) {
      return (
        <input
          ref={inputRef}
          className="chat-title-input"
          defaultValue={chatInfo.title}
          onKeyDown={(e) => handleRename({ chatInfo, messages: [] }, e)}
          onBlur={handleBlur}
        />
      );
    }
    return <div className="chat-title">{chatInfo.title}</div>;
  };

  const handleNewChat = () => {
    if (currentProject) {
      createNewChat("New Chat", currentProject.project_id);
    } else {
      createNewChat("New Chat");
    }
  };

  const renderProjectTitle = (item: { id: number; title: string }) => (
    <div className="project-title">{item.title}</div>
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
          onItemClick={handleProjectClick}
          renderItemContent={renderProjectTitle}
          leftIcon={<Folder size={16} />}
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
          onItemClick={handleChatClick}
          renderItemContent={(item) =>
            renderChatTitle({ chat_id: item.id, title: item.title })
          }
        />
      </div>
    </div>
  );
}
