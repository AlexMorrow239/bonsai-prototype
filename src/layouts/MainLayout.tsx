import { ReactElement, useState } from "react";

import { Outlet } from "react-router-dom";

import clsx from "clsx";

import { Sidebar } from "../components/layout/sidebar/Sidebar";
import { Topbar } from "../components/layout/topbar/Topbar";
import "./MainLayout.scss";

export const MainLayout = (): ReactElement => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    </div>
  );
};
