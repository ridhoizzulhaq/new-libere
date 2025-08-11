import React from "react";
import GoogleAuthButton from "../buttons/GoogleAuthButton";

const AuthLayout = () => {
  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
    // TODO: tambahkan logika auth
  };
  return (
    <main className="w-screen h-screen overflow-hidden bg-gray-100 text-gray-900 flex justify-center items-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <section className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="flex flex-col">
            <span className="text-2xl xl:text-3xl font-extrabold">Libere.</span>
            <p className="text-sm mt-2 text-zinc-600">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos
              explicabo ullam reiciendis tempore incidunt rem corrupti optio nam
              repellat. Voluptates.
            </p>
          </div>
          <div className="w-full mt-4 flex-1 flex-col items-start">
            <div className="flex flex-col items-center">
              <GoogleAuthButton
                text="Sign Up with Google"
                onClick={handleGoogleSignIn}
              />

              <div className="mx-auto max-w-xs">
                <p className="mt-6 text-xs text-gray-600 text-center">
                  I agree to abide by templatana's
                  <a
                    href="#"
                    className="border-b border-gray-500 border-dotted"
                  >
                    Terms of Service
                  </a>
                  and its
                  <a
                    href="#"
                    className="border-b border-gray-500 border-dotted"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/auth-illustration.png')",
            }}
          ></div>
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
