import { ReactNode } from "react";

import "./ChatLoader.scss";

interface ChatLoadingIndicatorProps {
  message?: string;
}

export function ChatLoadingIndicator({
  message = "Generating",
}: ChatLoadingIndicatorProps): ReactNode {
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
