import { useState } from "react";

import { Plus } from "lucide-react";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";

import "./ChatTopbar.scss";

export default function ChatTopbar() {
  const {
    currentChat,
    archiveChat,
    unarchiveChat,
    setIsRenamingChat,
    createNewChat,
  } = useChatStore();
  const { currentProject, deleteProject } = useProjectStore();
  const { addToast } = useUIStore();

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
    archiveChat(currentChat.chatInfo.chat_id);
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
          <Dropdown trigger="Edit Chat">
            <button
              className="dropdown__item"
              onClick={() =>
                currentChat && setIsRenamingChat(currentChat.chatInfo.chat_id)
              }
            >
              Rename
            </button>
            {currentChat.chatInfo.is_active ? (
              <button
                className="dropdown__item"
                onClick={() => {
                  archiveChat(currentChat?.chatInfo.chat_id);
                }}
              >
                Archive
              </button>
            ) : (
              <button
                className="dropdown__item"
                onClick={() => {
                  unarchiveChat(currentChat?.chatInfo.chat_id);
                }}
              >
                Unarchive
              </button>
            )}
            <button
              className="dropdown__item dropdown__item--danger"
              onClick={() => setIsDeleteChatModalOpen(true)}
            >
              Delete
            </button>
          </Dropdown>
        )}

        {currentProject && (
          <Dropdown trigger="Edit Project">
            <button className="dropdown__item">Rename Project</button>
            <button
              className="dropdown__item dropdown__item--danger"
              onClick={() => setIsDeleteProjectModalOpen(true)}
            >
              Delete Project
            </button>
          </Dropdown>
        )}
      </div>

      <button
        className="new-chat-button"
        title="Start new chat"
        onClick={handleNewChat}
      >
        <Plus size={20} />
      </button>

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
        description="Are you sure you want to delete this project? All associated chats will be deleted. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteProject}
        confirmVariant="danger"
      />
    </div>
  );
}
