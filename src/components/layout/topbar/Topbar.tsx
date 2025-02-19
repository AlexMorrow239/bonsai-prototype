import { ReactElement } from "react";

import { useLocation } from "react-router-dom";

import ChatTopbar from "@/components/features/chat-topbar/ChatTopbar";
import ProjectTopbar from "@/components/features/project-topbar/ProjectTopbar";

import "./Topbar.scss";

export const Topbar = (): ReactElement => {
  const location = useLocation();

  const renderTopbarContent = (): ReactElement => {
    // Chat routes
    if (location.pathname === "/" || location.pathname === "/chat") {
      return <ChatTopbar />;
    }

    // Project routes
    if (location.pathname.startsWith("/project")) {
      return <ProjectTopbar />;
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
