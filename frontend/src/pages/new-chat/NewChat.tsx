import { ReactElement, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { ChatPrompt } from "@/components/features/chat-prompt/ChatPrompt";

import { useCreateChat } from "@/hooks/api/useChats";
import { useSendMessage } from "@/hooks/api/useMessages";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { useToastActions } from "@/stores/uiStore";
import type { Chat, UploadedFile } from "@/types";

import "./NewChat.scss";

export function NewChat(): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const { showErrorToast } = useToastActions();
  const { addMessage } = useMessageStore();
  const { setCurrentChat, setChats } = useChatStore();
  const navigate = useNavigate();

  const createChat = useCreateChat();
  const sendMessage = useSendMessage();

  const handleFirstMessage = async (
    content: string,
    files?: UploadedFile[]
  ) => {
    const hasContent = content.trim().length > 0 || (files && files.length > 0);
    if (!hasContent) return;

    try {
      // Create new chat first
      const newChat = await createChat.mutateAsync({
        title: content.slice(0, 50),
        is_active: true,
      });

      if (!newChat) {
        throw new Error("Failed to create chat");
      }

      // Send first message using the sendMessage mutation
      const userMessage = await sendMessage.mutateAsync({
        chatId: newChat._id,
        content: content.trim(),
        files: files?.map((f) => f.file).filter((f): f is File => !!f),
        is_ai_response: false,
      });

      // Update stores with new chat and message
      setChats((prevChats: Chat[]): Chat[] => [...prevChats, newChat]);
      addMessage(newChat._id, userMessage);
      setCurrentChat(newChat);

      // Navigate to chat view after everything is done
      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error("[NewChat] Creation error:", error);
      showErrorToast(error, "Failed to create chat");
    }
  };

  return (
    <main className="new-chat">
      <div className="new-chat__content">
        <h1>Start a New Chat</h1>
        <p>Type your message to begin a new conversation</p>
      </div>
      <ChatPrompt
        onSubmit={handleFirstMessage}
        textareaRef={textareaRef}
        isNewChat={true}
      />
    </main>
  );
}
