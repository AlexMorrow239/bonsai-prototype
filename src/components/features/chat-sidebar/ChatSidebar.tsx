import React, { useEffect, useRef } from "react";

import { Button } from "@/components/common/button/Button";

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

  const renderProjectChats = (projectId: number) => {
    const projectChats = getChatsByProject(projectId).filter(
      (chat) => chat.chatInfo.is_active
    );
    if (projectChats.length === 0) return null;

    return (
      <div className="project-chats" key={projectId}>
        {showActive &&
          projectChats.map((chat) => (
            <button
              key={chat.chatInfo.chat_id}
              className={`chat-item ${
                currentChat?.chatInfo.chat_id === chat.chatInfo.chat_id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                isRenamingChat ? null : setCurrentChat(chat.chatInfo.chat_id)
              }
            >
              {renderChatTitle(chat)}
            </button>
          ))}
      </div>
    );
  };

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <select
          value={currentProject?.project_id || "all"}
          onChange={(e) => {
            const value = e.target.value;
            setCurrentProject(value === "all" ? 0 : Number(value));
          }}
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.project_id} value={project.project_id}>
              {project.name}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          size="md"
          className="new-chat-btn"
          onClick={handleNewChat}
        >
          New Chat
        </Button>
      </div>

      <div className="chats-list">
        {!currentProject ? (
          <>
            <div className="list-header">
              <h3>Active Chats</h3>
            </div>
            {showActive &&
              activeChats.map((chat) => (
                <Button
                  key={chat.chat_id}
                  variant="ghost"
                  className={`chat-item ${
                    currentChat?.chatInfo.chat_id === chat.chat_id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    isRenamingChat ? null : setCurrentChat(chat.chat_id)
                  }
                >
                  {renderChatTitle({ chatInfo: chat })}
                </Button>
              ))}
          </>
        ) : (
          <>
            <div
              className="list-header"
              onClick={() => setShowActive(!showActive)}
            >
              <h3>Project Chats</h3>
              <span className="toggle">{showActive ? "−" : "+"}</span>
            </div>
            {showActive && renderProjectChats(currentProject.project_id)}
          </>
        )}

        <div
          className="list-header archived"
          onClick={() => setShowArchived(!showArchived)}
        >
          <h3>Archived Chats</h3>
          <span className="toggle">{showArchived ? "−" : "+"}</span>
        </div>
        {showArchived &&
          archivedChats.map((chat) => (
            <Button
              key={chat.chat_id}
              variant="ghost"
              className={`chat-item archived ${
                currentChat?.chatInfo.chat_id === chat.chat_id ? "active" : ""
              }`}
              onClick={() =>
                isRenamingChat ? null : setCurrentChat(chat.chat_id)
              }
            >
              {renderChatTitle({ chatInfo: chat })}
            </Button>
          ))}
      </div>
    </aside>
  );
}
