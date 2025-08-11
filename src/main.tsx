import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Providers from "./providers/PrivyProvider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthScreen from "./pages/AuthScreen.tsx";
import LibraryScreen from "./pages/LibraryScreen.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthScreen />,
  },
  {
    path: "/auth",
    element: <AuthScreen />,
  },
  {
    path: "/libraries",
    element: <LibraryScreen />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>
);
