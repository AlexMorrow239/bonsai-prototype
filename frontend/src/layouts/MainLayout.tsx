import { ReactElement, useEffect, useState } from "react";

import { Outlet } from "react-router-dom";

import clsx from "clsx";

import { Toast } from "@/components/common/toast/Toast";

import { useChats } from "@/hooks/api/useChats";
import { useProjects } from "@/hooks/api/useProjects";
import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";

import { Sidebar } from "../components/layout/sidebar/Sidebar";
import { Topbar } from "../components/layout/topbar/Topbar";
import "./MainLayout.scss";

export const MainLayout = (): ReactElement => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data: chatsData } = useChats();
  const { data: projectsData } = useProjects();
  const { setChats } = useChatStore();
  const { setProjects } = useProjectStore();

  useEffect(() => {
    if (chatsData?.items) {
      setChats(chatsData.items);
    }
  }, [chatsData, setChats]);

  useEffect(() => {
    if (projectsData?.items) {
      setProjects(projectsData.items);
    }
  }, [projectsData, setProjects]);

  // Sidebar is expanded if either pinned or hovered
  const isExpanded = isPinned || isHovered;

  return (
    <div className={clsx("layout", { "sidebar-expanded": isExpanded })}>
      <aside
        className={clsx("layout__sidebar", { expanded: isExpanded })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Sidebar
          isExpanded={isExpanded}
          isPinned={isPinned}
          onPinnedChange={setIsPinned}
        />
      </aside>
      <div className="layout__main-container">
        <header className="layout__topbar">
          <Topbar />
        </header>
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
};
