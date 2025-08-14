import React from "react";
import Navbar from "../Navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <main className="w-full h-fit mb-[5rem] min-h-screen bg-white flex-1 flex-col items-center justify-center px-5">
      <Navbar />
      {children}
    </main>
  );
};

export default HomeLayout;
