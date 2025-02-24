import { type ReactNode, useEffect } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "@/styles/main.scss";

import { MainLayout } from "@/layouts/MainLayout";
import { queryClient } from "@/lib/query-client";
import CurrentChat from "@/pages/chat/current-chat/CurrentChat";
import { NewChat } from "@/pages/chat/new-chat/NewChat";
import { FileManager } from "@/pages/FileManager/FileManager";
import NotFound from "@/pages/not-found/NotFound";
import { CurrentProject } from "@/pages/project/current-project/CurrentProject";
import { NewProject } from "@/pages/project/new-project/NewProject";
import { useThemeStore } from "@/stores/themeStore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <NewChat />,
      },
      {
        path: "/chat/new",
        element: <NewChat />,
      },
      {
        path: "/chat/:chatId",
        element: <CurrentChat />,
      },
      {
        path: "/project/new",
        element: <NewProject />,
      },
      {
        path: "/project/:projectId",
        element: <CurrentProject />,
      },
      {
        path: "/files",
        element: <FileManager />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App(): ReactNode {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
