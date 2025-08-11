import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Providers from "./providers/PrivyProvider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthScreen from "./pages/AuthScreen.tsx";
import LibraryScreen from "./pages/LibraryScreen.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthScreen />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <LibraryScreen /> },
      { path: "/libraries", element: <LibraryScreen /> }
    ]
  }
  
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>
);
