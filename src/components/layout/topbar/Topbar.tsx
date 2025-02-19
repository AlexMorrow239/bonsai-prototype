import { ReactElement } from "react";

import { useLocation } from "react-router-dom";

import ChatTopbar from "@/components/features/chat-topbar/ChatTopbar";

// import FileTopbar from "@/components/features/file-topbar/FileTopbar";

import "./Topbar.scss";

export const Topbar = (): ReactElement => {
  const location = useLocation();

  const renderTopbarContent = (): ReactElement => {
    // Use startsWith to match all project routes
    if (
      location.pathname === "/" ||
      location.pathname === "/chat" ||
      location.pathname.startsWith("/project")
    ) {
      return <ChatTopbar />;
    }

    return (
      <>
        <div className="topbar__info">
          <span>Welcome</span>
        </div>
        <div className="topbar__actions">{/* Default actions */}</div>
      </>
    );
  };

  return <div className="topbar">{renderTopbarContent()}</div>;
};
