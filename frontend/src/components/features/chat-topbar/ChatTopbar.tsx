import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useDeleteChat, useUpdateChat } from "@/hooks/api/useChats";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";

export default function ChatTopbar() {
  const navigate = useNavigate();
  const { currentChat, setCurrentChat } = useChatStore();
  const { showSuccessToast, showErrorToast } = useUIStore();
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

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
      showSuccessToast("Chat deleted successfully");
      setIsDeleteChatModalOpen(false);
      navigate("/chat/new");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleRenameChat = async () => {
    if (!currentChat?._id) return;
    setIsRenaming(true);

    try {
      const updatedChat = await updateChatMutation.mutateAsync({
        id: currentChat._id,
        title: "Renamed Chat", // You'll want to add a proper rename input UI
      });
      setCurrentChat(updatedChat);
      setIsRenaming(false);
      showSuccessToast("Chat renamed successfully");
    } catch (error) {
      showErrorToast(error);
      setIsRenaming(false);
    }
  };

  const chatDropdown = currentChat && (
    <Dropdown trigger="Edit Chat" variant="ghost">
      <Button
        variant="ghost"
        fullWidth
        onClick={handleRenameChat}
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

  return (
    <>
      <ContextTopbar
        dropdownSection={chatDropdown}
        onNewItem={handleNewChat}
        newItemTitle="Start new chat"
      />

      <ActionModal
        isOpen={isDeleteChatModalOpen}
        onClose={() => setIsDeleteChatModalOpen(false)}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteChat}
        confirmVariant="danger"
      />
    </>
  );
}
