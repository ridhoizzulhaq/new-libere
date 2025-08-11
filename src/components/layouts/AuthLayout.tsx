import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const authImage = "/images/auth-illustration.png";
  return (
    <main className="w-screen h-screen overflow-hidden bg-gray-100 text-gray-900 flex justify-center items-center">
      <div className="max-w-screen-xl max-h-[80vh] m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <section className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex flex-col items-center justify-center">{children}</section>

        <div className="text-center hidden lg:flex p-4">
          <img
            src={authImage}
            alt="Libere Background"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
