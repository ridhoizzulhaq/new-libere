import React from "react";
import Navbar from "../Navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <main className="w-full h-fit min-h-screen flex-1 flex-col bg-cover bg-top bg-white px-5 xs:px-10 md:px-16">
      <Navbar />
      {children}
    </main>
  );
};

export default HomeLayout;
