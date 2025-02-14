import Home from '@/pages/home/Home';
import { type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import '@/styles/main.scss'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

function App(): ReactNode {
  return <RouterProvider router={router} />;
}

export default App;