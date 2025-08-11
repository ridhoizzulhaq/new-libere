import React from "react";
import Navbar from "../Navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-pattern bg-cover bg-top bg-dark-100 px-5 xs:px-10 md:px-16;">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <div className="mt-20 pb-20">{children}</div>
      </div>
    </main>
  );
};

export default HomeLayout;
