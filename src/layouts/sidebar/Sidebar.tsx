import { ReactElement } from "react";

import { useLocation } from "react-router-dom";

import clsx from "clsx";
import { ChevronRight, Pin, PinOff } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import ChatSidebar from "@/components/layout/chat-sidebar/ChatSidebar";
import FileSidebar from "@/components/layout/file-sidebar/FileSidebar";

import "./Sidebar.scss";

interface SidebarProps {
  isExpanded: boolean;
  isPinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
}

export const Sidebar = ({
  isExpanded,
  isPinned,
  onPinnedChange,
}: SidebarProps): ReactElement => {
  const location = useLocation();

  const renderSidebarContent = (): ReactElement => {
    if (
      location.pathname === "/" ||
      location.pathname === "/chat" ||
      location.pathname.startsWith("/project")
    ) {
      return <ChatSidebar />;
    }
    if (location.pathname === "/files") {
      return <FileSidebar />;
    }
    return <div>No sidebar content</div>;
  };

  return (
    <div
      className={clsx("sidebar", {
        expanded: isExpanded,
        collapsed: !isExpanded,
        pinned: isPinned,
      })}
    >
      <div className="sidebar__header">
        <Button
          variant="ghost"
          className={clsx("sidebar__toggle", { "is-pinned": isPinned })}
          onClick={() => onPinnedChange(!isPinned)}
          isIconButton
        >
          <ChevronRight className="sidebar__toggle-chevron" size={18} />
        </Button>
        <Button
          variant="ghost"
          className={clsx("sidebar__pin", { "is-pinned": isPinned })}
          onClick={() => onPinnedChange(!isPinned)}
          isIconButton
          title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
        >
          {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
        </Button>
      </div>
      <div className="sidebar__content">{renderSidebarContent()}</div>
    </div>
  );
};
