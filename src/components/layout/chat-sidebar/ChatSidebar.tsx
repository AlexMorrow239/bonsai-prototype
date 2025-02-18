import React, { useEffect, useRef } from "react";

import { Button } from "@/components/common/button/Button";
import { FilterDropdown } from "@/components/common/filter-dropdown/FilterDropdown";
import { ChatSection } from "@/components/layout/chat-sidebar/chat-section/ChatSection";

import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";

import "./ChatSidebar.scss";

export default function ChatSidebar() {
  const {
    activeChats,
    archivedChats,
    currentChat,
    setCurrentChat,
    createNewChat,
    getChatsByProject,
    isRenamingChat,
    setIsRenamingChat,
    updateChatTitle,
  } = useChatStore();
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const [showArchived, setShowArchived] = React.useState(false);
  const [showActive, setShowActive] = React.useState(true);
  const [projectSearchValue, setProjectSearchValue] = React.useState("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] =
    React.useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleProjectSelect = (projectName: string) => {
    const project = projects.find((p) => p.name === projectName);
    setCurrentProject(project ? project.project_id : 0);
  };

  const selectedProject = currentProject
    ? projects.find((p) => p.project_id === currentProject.project_id)?.name ||
      ""
    : "";

  const filteredProjects = projects
    .map((p) => p.name)
    .filter((name) =>
      name.toLowerCase().includes(projectSearchValue.toLowerCase())
    );

  const unselectedProjects = filteredProjects.filter(
    (name) => !selectedProject.includes(name)
  );

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

  const renderProjectChats = (projectId: number) => {
    const projectChats = getChatsByProject(projectId).filter(
      (chat) => chat.chatInfo.is_active
    );

    return (
      <ChatSection
        title="Project Chats"
        chats={projectChats.map((chat) => chat.chatInfo)}
        isExpanded={showActive}
        onToggleExpand={() => setShowActive(!showActive)}
        currentChatId={currentChat?.chatInfo.chat_id}
        isRenamingChat={isRenamingChat}
        onChatSelect={setCurrentChat}
        renderChatTitle={renderChatTitle}
      />
    );
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar__controls">
        <FilterDropdown
          isOpen={isProjectDropdownOpen}
          selected={selectedProject}
          searchValue={projectSearchValue}
          onSearchChange={setProjectSearchValue}
          onToggle={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          onSelect={handleProjectSelect}
          unselectedItems={unselectedProjects}
          placeholder="Select Project"
          searchPlaceholder="Search projects..."
        />
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
        {!currentProject ? (
          <ChatSection
            title="Active Chats"
            chats={activeChats}
            isExpanded={showActive}
            onToggleExpand={() => setShowActive(!showActive)}
            currentChatId={currentChat?.chatInfo.chat_id}
            isRenamingChat={isRenamingChat}
            onChatSelect={setCurrentChat}
            renderChatTitle={(chat) =>
              renderChatTitle({ chatInfo: chat.chatInfo })
            }
          />
        ) : (
          renderProjectChats(currentProject.project_id)
        )}

        <ChatSection
          title="Archived Chats"
          chats={archivedChats}
          isExpanded={showArchived}
          onToggleExpand={() => setShowArchived(!showArchived)}
          currentChatId={currentChat?.chatInfo.chat_id}
          isRenamingChat={isRenamingChat}
          onChatSelect={setCurrentChat}
          renderChatTitle={(chat) =>
            renderChatTitle({ chatInfo: chat.chatInfo })
          }
          isArchived
        />
      </div>
    </div>
  );
}
