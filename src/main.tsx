import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Providers from "./providers/PrivyProvider.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthScreen from "./pages/AuthScreen.tsx";
import HomeScreen from "./pages/HomeScreen.tsx";
import CreateBookV2Screen from "./pages/CreateBookV2Screen.tsx";
import BookDetailScreen from "./pages/BookDetailScreen.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />

          <Route path="/auth" element={<AuthScreen />} />

          <Route path="/books" element={<HomeScreen />} />
          <Route path="/books/:id" element={<BookDetailScreen />} />

          <Route path="/publish" element={<CreateBookV2Screen />} />

          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  </StrictMode>
);
