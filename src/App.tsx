import { type ReactNode, useEffect } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Toast } from "@components/common/toast/Toast";

import { MainLayout } from "@/components/layout/main-layout/MainLayout";

import "@/styles/main.scss";

import Chat from "@/pages/chat/Chat";
import Demo from "@/pages/demo/Demo";
import { ErrorBoundary } from "@/pages/error-boundary/ErrorBoundary";
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
        path: "/files",
        element: <Demo />,
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
