import { ReactNode } from "react";

import "./ChatLoader.scss";

interface ChatLoaderProps {
  message?: string;
}

export function ChatLoader({
  message = "Generating",
}: ChatLoaderProps): ReactNode {
  return (
    <div className="chat-loading">
      <div className="chat-loading__content">
        <span className="chat-loading__text">{message}</span>
        <span className="chat-loading__dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
}
