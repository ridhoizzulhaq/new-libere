import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Providers from "./providers/PrivyProvider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthScreen from "./pages/AuthScreen.tsx";
import LibraryScreen from "./pages/LibraryScreen.tsx";
import HomeScreen from "./pages/HomeScreen.tsx";
import CreateBookScreen from "./pages/CreateBookScreen.tsx";
import TestSmartWalletScreen from "./pages/TestSmartWalletScreen.tsx";
import CreateBookV2Screen from "./pages/CreateBookV2Screen.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthScreen />,
  },
  {
    path: "/home",
    element: <HomeScreen />,
  },
  {
    path: "/auth",
    element: <AuthScreen />,
  },
  {
    path: "/libraries",
    element: <LibraryScreen />,
  },
  {
    path: "/create-book",
    element: <CreateBookScreen />,
  },
  {
    path: "/v2",
    element: <CreateBookV2Screen />,
  },
  {
    path: "/test",
    element: <TestSmartWalletScreen />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>
);
