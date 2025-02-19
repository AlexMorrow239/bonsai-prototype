import { useState } from "react";

import { Moon, Plus, Sun } from "lucide-react";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import { useThemeStore } from "@/stores/themeStore";
import { useUIStore } from "@/stores/uiStore";

import "./ChatTopbar.scss";

export default function ChatTopbar() {
  const { currentChat, setIsRenamingChat, createNewChat } = useChatStore();
  const { currentProject, deleteProject } = useProjectStore();
  const { addToast } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();

  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] =
    useState(false);

  const handleNewChat = () => {
    if (currentProject) {
      createNewChat("New Chat", currentProject.project_id);
    } else {
      createNewChat("New Chat");
    }
  };

  const handleDeleteChat = () => {
    if (!currentChat) return;
    addToast({ type: "success", message: "Chat deleted successfully" });
    setIsDeleteChatModalOpen(false);
  };

  const handleDeleteProject = () => {
    if (!currentProject) return;
    deleteProject(currentProject.project_id);
    addToast({ type: "success", message: "Project deleted successfully" });
    setIsDeleteProjectModalOpen(false);
  };

  return (
    <div className="chat-topbar">
      <div className="dropdown-section">
        {currentChat && (
          <Dropdown trigger="Edit Chat" variant="ghost">
            <Button
              variant="ghost"
              fullWidth
              onClick={() =>
                currentChat && setIsRenamingChat(currentChat.chatInfo.chat_id)
              }
            >
              Rename
            </Button>
            <Button
              variant="ghost"
              fullWidth
              className="dropdown__item--danger"
              onClick={() => setIsDeleteChatModalOpen(true)}
            >
              Delete
            </Button>
          </Dropdown>
        )}

        {currentProject && (
          <Dropdown trigger="Edit Project" variant="ghost">
            <Button variant="ghost" fullWidth>
              Rename
            </Button>
            <Button
              variant="ghost"
              fullWidth
              className="dropdown__item--danger"
              onClick={() => setIsDeleteProjectModalOpen(true)}
            >
              Delete
            </Button>
          </Dropdown>
        )}
      </div>

      <div className="topbar-actions">
        <Button
          variant="ghost"
          size="sm"
          isIconButton
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </Button>

        <Button
          variant="primary"
          size="sm"
          isIconButton
          title="Start new chat"
          onClick={handleNewChat}
        >
          <Plus size={20} />
        </Button>
      </div>

      <ActionModal
        isOpen={isDeleteChatModalOpen}
        onClose={() => setIsDeleteChatModalOpen(false)}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteChat}
        confirmVariant="danger"
      />

      <ActionModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => setIsDeleteProjectModalOpen(false)}
        title="Delete Project"
        description="All associated chats will be deleted. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteProject}
        confirmVariant="danger"
      />
    </div>
  );
}
