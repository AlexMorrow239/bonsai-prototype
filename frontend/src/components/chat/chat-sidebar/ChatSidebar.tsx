import React, { useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { Folder } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { SidebarSection } from "@/components/common/sidebar-section/SidebarSection";

import { useChats } from "@/hooks/api/useChats";
import { useProjects } from "@/hooks/api/useProjects";
import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import type { Chat } from "@/types";

import "./ChatSidebar.scss";

export default function ChatSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: chatsData, isLoading: isChatsLoading } = useChats();
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects();

  // Split store subscriptions to minimize re-renders
  const currentChat = useChatStore((state) => state.currentChat);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);
  const chats = useChatStore((state) => state.chats) as Chat[];
  const setChats = useChatStore((state) => state.setChats);

  // Project store subscriptions
  const currentProject = useProjectStore((state) => state.currentProject);
  const setProjects = useProjectStore((state) => state.setProjects);

  const [showActive, setShowActive] = React.useState(true);
  const [showProjects, setShowProjects] = React.useState(true);

  // Update chats when data changes from the API
  useEffect(() => {
    if (chatsData) {
      setChats(chatsData);
    }
  }, [chatsData, setChats]);

  // Handle the case when a chat is deleted
  useEffect(() => {
    // If we're on a chat route but the current chat doesn't exist in the chats array
    // (which means it was deleted), navigate to new chat
    if (
      location.pathname.startsWith("/chat/") &&
      location.pathname !== "/chat/new" &&
      currentChat &&
      chats.length > 0 &&
      !chats.some((chat) => chat._id === currentChat._id)
    ) {
      navigate("/chat/new");
    }
  }, [chats, currentChat, location.pathname, navigate]);

  // Ensure the sidebar chat list is in sync with the store
  useEffect(() => {
    // This effect ensures that when a chat is deleted from another component,
    // the sidebar updates immediately without waiting for a refetch
    if (chatsData && chats && chatsData.length !== chats.length) {
      // If the lengths don't match, sync with the most up-to-date data
      // This handles both additions and deletions
      if (chatsData.length > chats.length) {
        // New chats were added
        setChats(chatsData);
      } else if (chats.length > chatsData.length && chatsData.length > 0) {
        // Some chats might have been deleted but not reflected in the API yet
        // In this case, we keep the store's version which should be more up-to-date
        // after a deletion operation
      }
    }
  }, [chatsData, chats, setChats]);

  // Update projects when data changes
  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData);
    }
  }, [projectsData, setProjects]);

  const handleChatClick = (chatId: string) => {
    const chat = (chats || []).find((c) => c._id === chatId);
    if (chat) {
      setCurrentChat(chat);
      navigate(`/chat/${chatId}`);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
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

  // Transform projects into the format expected by SidebarSection
  const projectItems = React.useMemo(() => {
    return (projectsData || []).map((project) => ({
      id: project._id,
      title: project.name,
    }));
  }, [projectsData]);

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
        {/* Projects Section */}
        {isProjectsLoading ? (
          <div>Loading projects...</div>
        ) : projectItems.length === 0 ? (
          <div>No projects available</div>
        ) : (
          <SidebarSection
            title="Projects"
            items={projectItems}
            isExpanded={showProjects}
            onToggleExpand={() => setShowProjects(!showProjects)}
            currentItemId={currentProject?._id}
            onItemClick={handleProjectClick}
            renderItemContent={(item) => (
              <div className="project-title">{item.title}</div>
            )}
            leftIcon={<Folder />}
          />
        )}

        {/* Chats Section */}
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
            onItemClick={handleChatClick}
            renderItemContent={(item) => (
              <div className="chat-title">{item.title}</div>
            )}
          />
        )}
      </div>
    </div>
  );
}
