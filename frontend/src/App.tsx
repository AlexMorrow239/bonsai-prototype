import { type ReactNode, useEffect } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "@/styles/main.scss";

import { queryClient } from "@/lib/query-client";
import { MainLayout } from "@/layouts/MainLayout";
import Chat from "@/pages/chat/Chat";
import { ErrorBoundary } from "@/pages/error-boundary/ErrorBoundary";
import NotFound from "@/pages/not-found/NotFound";
import Project from "@/pages/project/Project";
import { useThemeStore } from "@/stores/themeStore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Chat />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/project/:projectId",
        element: <Project />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
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
