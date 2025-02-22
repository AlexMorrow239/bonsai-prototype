import { type ReactNode, useEffect } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "@/styles/main.scss";

import { MainLayout } from "@/layouts/MainLayout";
import { queryClient } from "@/lib/query-client";
import CurrentChat from "@/pages/current-chat/CurrentChat";
import { CurrentProject } from "@/pages/current-project/CurrentProject";
import { ErrorBoundary } from "@/pages/error-boundary/ErrorBoundary";
import { NewChat } from "@/pages/new-chat/NewChat";
import { NewProject } from "@/pages/new-project/NewProject";
import NotFound from "@/pages/not-found/NotFound";
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
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
