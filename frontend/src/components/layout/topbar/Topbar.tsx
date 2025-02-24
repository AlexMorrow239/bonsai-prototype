import { ReactElement } from "react";

import { useLocation } from "react-router-dom";

import ChatTopbar from "@/components/chat/chat-topbar/ChatTopbar";
import FileManagerTopbar from "@/components/file-manager/file-manager-topbar/FileManagerTopbar";
import ProjectTopbar from "@/components/projects/project-topbar/ProjectTopbar";

import "./Topbar.scss";

export const Topbar = (): ReactElement => {
  const location = useLocation();

  const renderTopbarContent = (): ReactElement => {
    // Chat routes
    if (location.pathname === "/" || location.pathname.startsWith("/chat")) {
      return <ChatTopbar />;
    }

    // Project routes
    if (location.pathname.startsWith("/project")) {
      return <ProjectTopbar />;
    }

    // File manager route
    if (location.pathname.startsWith("/files")) {
      return <FileManagerTopbar />;
    }

    // Default topbar for other routes
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
