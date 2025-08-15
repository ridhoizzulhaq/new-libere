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
window.Buffer = Buffer; 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />

          <Route path="/auth" element={<AuthScreen />} />

          <Route path="/books" element={<HomeScreen />} />
          <Route path="/books/:id" element={<BookDetailScreen />} />

          <Route path="/libraries" element={<LibraryScreen />} />

          <Route path="/bookselfs" element={<BookselfScreen />} />

          <Route path="/publish" element={<CreateBookV2Screen />} />
          
          <Route path="/read-book/:epub" element={<EpubReaderScreen />} />

          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  </StrictMode>
);
