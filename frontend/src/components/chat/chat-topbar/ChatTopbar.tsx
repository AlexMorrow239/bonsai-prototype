import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";
import { Modal } from "@/components/common/modal/Modal";

import { useDeleteChat, useUpdateChat } from "@/hooks/api/useChats";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";

import "./ChatTopbar.scss";

export default function ChatTopbar() {
  const navigate = useNavigate();
  const { currentChat, setCurrentChat, chats, setChats } = useChatStore();
  const { showSuccessToast, showErrorToast } = useUIStore();
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);
  const [isRenameChatModalOpen, setIsRenameChatModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [inputError, setInputError] = useState("");

  // API mutations
  const deleteChatMutation = useDeleteChat();
  const updateChatMutation = useUpdateChat();

  const handleNewChat = async () => {
    try {
      navigate(`/chat/new`);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDeleteChat = async () => {
    if (!currentChat?._id) return;

    try {
      await deleteChatMutation.mutateAsync(currentChat._id);

      // Update the chats in the store by filtering out the deleted chat
      setChats(chats.filter((chat) => chat._id !== currentChat._id));

      // Set current chat to null since it's been deleted
      setCurrentChat(null);

      showSuccessToast("Chat deleted successfully");
      setIsDeleteChatModalOpen(false);
      navigate("/chat/new");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const openRenameModal = () => {
    if (!currentChat) return;
    setNewChatTitle(currentChat.title || "");
    setInputError("");
    setIsRenameChatModalOpen(true);
  };

  const validateChatTitle = (title: string): boolean => {
    if (!title.trim()) {
      setInputError("Chat name cannot be empty");
      return false;
    }

    if (title.trim().length > 50) {
      setInputError("Chat name must be 50 characters or less");
      return false;
    }

    setInputError("");
    return true;
  };

  const handleRenameChat = async () => {
    if (!currentChat?._id) return;
    if (!validateChatTitle(newChatTitle)) return;

    setIsRenaming(true);

    try {
      const updatedChat = await updateChatMutation.mutateAsync({
        id: currentChat._id,
        title: newChatTitle.trim(),
      });

      // Update current chat
      setCurrentChat(updatedChat);

      // Update chat in the chats list
      setChats(
        chats.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat))
      );

      setIsRenaming(false);
      setIsRenameChatModalOpen(false);
      showSuccessToast("Chat renamed successfully");
    } catch (error) {
      showErrorToast(error);
      setIsRenaming(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewChatTitle(e.target.value);
    if (inputError) {
      validateChatTitle(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isRenaming) {
      e.preventDefault();
      handleRenameChat();
    } else if (e.key === "Escape" && !isRenaming) {
      setIsRenameChatModalOpen(false);
    }
  };

  const chatDropdown = currentChat && (
    <Dropdown trigger="Edit Chat" variant="ghost">
      <Button
        variant="ghost"
        fullWidth
        onClick={openRenameModal}
        disabled={isRenaming}
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
  );

  const renameModalFooter = (
    <div className="rename-modal__footer">
      <Button
        variant="outline"
        onClick={() => setIsRenameChatModalOpen(false)}
        disabled={isRenaming}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleRenameChat}
        disabled={isRenaming || !newChatTitle.trim()}
        className={isRenaming ? "rename-button--loading" : ""}
      >
        {isRenaming ? "Renaming..." : "Rename"}
      </Button>
    </div>
  );

  return (
    <>
      <ContextTopbar
        dropdownSection={chatDropdown}
        onNewItem={handleNewChat}
        newItemTitle="Start new chat"
      />

      {/* Delete Chat Modal */}
      <ActionModal
        isOpen={isDeleteChatModalOpen}
        onClose={() => setIsDeleteChatModalOpen(false)}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteChat}
        confirmVariant="danger"
      />

      {/* Rename Chat Modal */}
      <Modal
        isOpen={isRenameChatModalOpen}
        onClose={() => !isRenaming && setIsRenameChatModalOpen(false)}
        title="Rename Chat"
        description="Enter a new name for this chat"
        footer={renameModalFooter}
        size="sm"
      >
        <div className="rename-modal__content">
          <input
            type="text"
            value={newChatTitle}
            onChange={handleInputChange}
            placeholder="Chat name"
            autoFocus
            className={`rename-chat-input ${inputError ? "has-error" : ""}`}
            onKeyDown={handleKeyDown}
            disabled={isRenaming}
            maxLength={50}
          />
          {inputError && (
            <div className="rename-modal__error">{inputError}</div>
          )}
        </div>
      </Modal>
    </>
  );
}
