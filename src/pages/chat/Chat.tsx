import React from "react";

import { useChatStore } from "@/stores/chatStore";

import "./Chat.scss";

export default function Chat() {
  const { currentChat, addMessage } = useChatStore();
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    // Add user message
    addMessage(currentChat.chatInfo.chat_id, {
      content: message.trim(),
      created_at: new Date().toISOString(),
      is_ai_response: false,
    });

    // Simulate AI response
    setTimeout(() => {
      addMessage(currentChat.chatInfo.chat_id, {
        content:
          "This is a simulated AI response. The actual AI integration will be implemented later.",
        created_at: new Date().toISOString(),
        is_ai_response: true,
      });
    }, 1000);

    setMessage("");
  };

  return (
    <main className="chat-main">
      {currentChat ? (
        <>
          <div className="chat-messages">
            {currentChat.messages.map((msg) => (
              <div
                key={msg.message_id}
                className={`message ${msg.is_ai_response ? "ai" : "user"}`}
              >
                <div className="message-content">{msg.content}</div>
                <div className="message-timestamp">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button type="submit" disabled={!message.trim()}>
              Send
            </button>
          </form>
        </>
      ) : (
        <div className="no-chat-selected">
          <h2>Select a chat or start a new conversation</h2>
        </div>
      )}
    </main>
  );
}
