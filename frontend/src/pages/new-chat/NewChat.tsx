import { ReactElement, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { ChatPrompt } from "@/components/features/chat-prompt/ChatPrompt";

import { useCreateChat } from "@/hooks/api/useChats";
import { useSendMessage } from "@/hooks/api/useMessages";
import { simulateAIResponse } from "@/services/aiService";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { useToastActions } from "@/stores/uiStore";
import type { Message, UploadedFile } from "@/types";

import "./NewChat.scss";

export function NewChat(): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const { showErrorToast } = useToastActions();
  const { addMessage, removeMessage: removeStoreMessage } = useMessageStore();
  const {
    setCurrentChat,
    setChats,
    chats,
    removeMessage: removeChatMessage,
  } = useChatStore();
  const navigate = useNavigate();

  const createChat = useCreateChat();
  const sendMessage = useSendMessage();

  const handleFirstMessage = async (
    content: string,
    files?: UploadedFile[]
  ) => {
    const hasContent = content.trim().length > 0 || (files && files.length > 0);
    if (!hasContent) return;

    const tempMessageId = `temp-${Date.now()}`;
    let newChat;

    try {
      // Create new chat first
      newChat = await createChat.mutateAsync({
        title: content.slice(0, 50),
        is_active: true,
      });

      if (!newChat) {
        throw new Error("Failed to create chat");
      }

      // Add message to local store first with temporary ID
      const pendingMessage: Message = {
        _id: tempMessageId,
        chat_id: newChat._id,
        content: content.trim(),
        files: files,
        is_ai_response: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update stores with new chat and pending message
      setChats([...chats, newChat]);
      addMessage(newChat._id, pendingMessage);
      setCurrentChat(newChat);

      // Send user message
      const userMessage = await sendMessage.mutateAsync({
        chatId: newChat._id,
        content: content.trim(),
        files: files
          ? files?.map((f) => f.file).filter((f): f is File => !!f)
          : [],
        is_ai_response: false,
      });

      // Remove temporary message and add server response
      if (userMessage) {
        removeChatMessage(newChat._id, tempMessageId);
        removeStoreMessage(newChat._id, tempMessageId);
        addMessage(newChat._id, userMessage);
      }

      try {
        // Replace Gemini response generation with simulated response
        const aiContent = await simulateAIResponse(content.trim());

        if (!aiContent) {
          throw new Error("Empty response from AI");
        }

        // Send AI response to backend
        const aiMessage = await sendMessage.mutateAsync({
          chatId: newChat._id,
          content: aiContent,
          is_ai_response: true,
        });

        // Add AI response to local state
        addMessage(newChat._id, aiMessage);
      } catch (aiError) {
        console.error("[NewChat] AI response error:", aiError);
        showErrorToast(aiError, "Failed to generate AI response");
      }

      // Navigate to chat view after everything is done
      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error("[NewChat] Creation error:", error);
      showErrorToast(error, "Failed to create chat");
      // If we have a newChat._id, clean up the temporary message
      if (newChat?._id) {
        removeChatMessage(newChat._id, tempMessageId);
        removeStoreMessage(newChat._id, tempMessageId);
      }
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
