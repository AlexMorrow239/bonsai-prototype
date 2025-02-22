import React, { useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { Folder } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { SidebarSection } from "@/components/common/sidebar-section/SidebarSection";

import { useCreateChat, useUpdateChat } from "@/hooks/api/useChats";
import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";
import type { Chat } from "@/types/api";

import "./ChatSidebar.scss";

export default function ChatSidebar() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Store state
  const {
    currentChat,
    setCurrentChat,

    chats,
  } = useChatStore();

  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const { showErrorToast, showSuccessToast } = useToastActions();

  // API mutations
  const createChat = useCreateChat();
  const updateChat = useUpdateChat();

  const [showActive, setShowActive] = React.useState(true);
  const [showProjects, setShowProjects] = React.useState(true);

  // useEffect(() => {
  //   if (isRenamingChat && inputRef.current) {
  //     inputRef.current.focus();
  //   }
  // }, [isRenamingChat]);

  const handleChatClick = (chatId: string) => {
    setCurrentChat(chatId, navigate);
  };

  const handleProjectClick = (projectId: string) => {
    if (!projects) return;
    const project = projects.find((p) => p._id === projectId);
    setCurrentProject(project || null);
    navigate(`/project/${projectId}`);
  };

  const handleRename = async (
    chat: Chat,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      try {
        await updateChat.mutateAsync({
          id: chat._id,
          title: e.currentTarget.value,
        });
        showSuccessToast("Chat renamed successfully");
      } catch (error) {
        showErrorToast(error, "Failed to rename chat");
      }
      // } finally {
      //   setIsRenamingChat(null);
      // }
      // } else if (e.key === "Escape") {
      //   setIsRenamingChat(null);
      // }
    }
  };

  // const handleBlur = () => {
  //   setIsRenamingChat(null);
  // };

  const renderChatTitle = (chat: { id: string; title: string }) => {
    // if (isRenamingChat === chat.id) {
    //   return (
    //     <input
    //       ref={inputRef}
    //       className="chat-title-input"
    //       defaultValue={chat.title}
    //       onKeyDown={(e) =>
    //         handleRename({ _id: chat.id, title: chat.title } as Chat, e)
    //       }
    //       onBlur={handleBlur}
    //     />
    //   );
    // }
    return <div className="chat-title">{chat.title}</div>;
  };

  const handleNewChat = async () => {
    try {
      await createChat.mutateAsync({
        title: "New Chat",
        project_id: currentProject?._id,
      });
      showSuccessToast("New chat created");
    } catch (error) {
      showErrorToast(error, "Failed to create new chat");
    }
  };

  const renderProjectTitle = (item: { id: string; title: string }) => (
    <div className="project-title">{item.title}</div>
  );

  // Transform data for SidebarSection
  const projectItems =
    projects?.map((project) => ({
      id: project._id,
      title: project.name,
    })) || [];

  const chatItems = chats
    .filter((chat) => !chat.project_id)
    .map((chat) => ({
      id: chat._id,
      title: chat.title,
    }));

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
        <SidebarSection
          title="Projects"
          items={projectItems}
          isExpanded={showProjects}
          onToggleExpand={() => setShowProjects(!showProjects)}
          currentItemId={currentProject?._id}
          isRenaming={null}
          onItemClick={handleProjectClick}
          renderItemContent={renderProjectTitle}
          leftIcon={<Folder size={16} />}
          disableClickWhenRenaming={false}
        />
        <SidebarSection
          title="All Chats"
          items={chatItems}
          isExpanded={showActive}
          onToggleExpand={() => setShowActive(!showActive)}
          currentItemId={currentChat?._id}
          isRenaming="false"
          onItemClick={handleChatClick}
          renderItemContent={renderChatTitle}
        />
      </div>
    </div>
  );
}
