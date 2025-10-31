import React from "react";
import Navbar from "../Navbar";
import CurrencySelector from "../CurrencySelector";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full px-5">
        {children}
      </main>
      <CurrencySelector />
    </div>
  );
};

export default HomeLayout;
