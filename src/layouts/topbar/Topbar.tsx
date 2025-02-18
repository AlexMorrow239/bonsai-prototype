import { ReactElement } from "react";

import { useLocation } from "react-router-dom";

import ChatTopbar from "@/components/layout/chat-topbar/ChatTopbar";

// import FileTopbar from "@/components/features/file-topbar/FileTopbar";

import "./Topbar.scss";

export const Topbar = (): ReactElement => {
  const location = useLocation();

  const renderTopbarContent = (): ReactElement => {
    switch (location.pathname) {
      case "/":
      case "/chat":
        return <ChatTopbar />;
      case "/files":
        return <ChatTopbar />;
      default:
        return (
          <>
            <div className="topbar__info">
              <span>Welcome</span>
            </div>
            <div className="topbar__actions">{/* Default actions */}</div>
          </>
        );
    }
  };

  return <div className="topbar">{renderTopbarContent()}</div>;
};
