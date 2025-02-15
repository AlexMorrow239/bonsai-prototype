import { ReactElement } from "react";

import { Outlet } from "react-router-dom";

import { Sidebar } from "../sidebar/Sidebar";
import { Topbar } from "../topbar/Topbar";
import "./MainLayout.scss";

export const MainLayout = (): ReactElement => {
  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
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
