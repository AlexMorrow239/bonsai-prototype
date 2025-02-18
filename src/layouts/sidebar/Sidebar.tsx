import { ReactElement } from "react";

import { useLocation } from "react-router-dom";

import ChatSidebar from "@/components/layout/chat-sidebar/ChatSidebar";
import FileSidebar from "@/components/layout/file-sidebar/FileSidebar";

import "./Sidebar.scss";

export const Sidebar = (): ReactElement => {
  const location = useLocation();

  const renderSidebarContent = (): ReactElement => {
    switch (location.pathname) {
      case "/":
        return <ChatSidebar />;
      case "/chat":
        return <ChatSidebar />;
      case "/files":
        return <FileSidebar />;
      default:
        return <div>No sidebar content</div>;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar__content">{renderSidebarContent()}</div>
    </div>
  );
};
