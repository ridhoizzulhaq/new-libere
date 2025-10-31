import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Providers from "./providers/PrivyProvider.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthScreen from "./pages/AuthScreen.tsx";
import HomeScreen from "./pages/HomeScreen.tsx";
import CreateBookV2Screen from "./pages/CreateBookV2Screen.tsx";
import BookDetailScreen from "./pages/BookDetailScreen.tsx";

import { Buffer } from 'buffer';
import LibraryScreen from "./pages/LibraryScreen.tsx";
import BookselfScreen from "./pages/BookselfScreen.tsx";
import EpubReaderScreen from "./pages/EpubReaderScreen.tsx";
import { CurrencyProvider } from "./contexts/CurrencyContext.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <CurrencyProvider>
        <BrowserRouter>
        <Routes>
          {/* Public routes - accessible without login */}
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/books" element={<HomeScreen />} />
          <Route path="/books/:id" element={<BookDetailScreen />} />

          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/libraries" element={<LibraryScreen />} />
            <Route path="/bookselfs" element={<BookselfScreen />} />
            {/* Temporarily hidden - Publish Book route */}
            {/* <Route path="/publish" element={<CreateBookV2Screen />} /> */}
            <Route path="/read-book/:id" element={<EpubReaderScreen />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </Providers>
  </StrictMode>
);
