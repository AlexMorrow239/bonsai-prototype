import { type ReactNode, useEffect } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Toast } from "@components/common/toast/Toast";

import "@/styles/main.scss";

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
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toast />
    </ErrorBoundary>
  );
}

export default App;
