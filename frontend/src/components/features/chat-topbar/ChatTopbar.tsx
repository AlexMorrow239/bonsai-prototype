import { useState } from "react";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";

export default function ChatTopbar() {
  const { currentChat, setIsRenamingChat, createNewChat } = useChatStore();
  const { addToast } = useUIStore();
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);

  const handleNewChat = () => {
    createNewChat("New Chat");
  };

  const handleDeleteChat = () => {
    if (!currentChat) return;
    addToast({ type: "success", message: "Chat deleted successfully" });
    setIsDeleteChatModalOpen(false);
  };

  const chatDropdown = currentChat && (
    <Dropdown trigger="Edit Chat" variant="ghost">
      <Button
        variant="ghost"
        fullWidth
        onClick={() => setIsRenamingChat(currentChat.chatInfo.chat_id)}
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
