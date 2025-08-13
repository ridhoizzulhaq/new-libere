import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [username, setUsername] = useState("");

  const { ready, authenticated, logout, user } = usePrivy();

  useEffect(() => {
    if (!user) return;

    const userGoogle = user.google;
    if (!userGoogle) return;

    const name = userGoogle.name || userGoogle.email;
    setUsername(name);
  }, [user]);

  const disableLogout = !ready || (ready && !authenticated);
  return (
    <nav className="bg-white border-gray-200 py-8">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto">
        <a href="/">
          <span className="text-2xl xl:text-3xl font-extrabold">Libere.</span>
        </a>
        <div className="flex items-center lg:order-2">
          <div className="hidden mt-2 mr-4 sm:inline-block">
            <span></span>
          </div>
          {authenticated ? (
            <div>
              <button
                disabled={disableLogout}
                onClick={logout}
                className="cursor-pointer capitalize text-white bg-dark-800 hover:bg-black focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0"
              >
                {authenticated ? username : "Logout"}
              </button>
            </div>
          ) : (
            <button
              disabled={disableLogout}
              onClick={logout}
              className="cursor-pointer capitalize text-white bg-dark-800 hover:bg-black focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0"
            >
              {authenticated ? username : "Logout"}
            </button>
          )}

          <div className="h-10 w-10 overflow-hidden rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-10 w-10 p-2 text-white bg-gray-500 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>
          {authenticated && (
            <button
              disabled={disableLogout}
              onClick={logout}
              className="cursor-pointer capitalize text-white bg-dark-800 hover:bg-black focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0"
            >
              Logout
            </button>
          )}
          
          <button
            data-collapse-toggle="mobile-menu-2"
            type="button"
            className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="mobile-menu-2"
            aria-expanded="true"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <svg
              className="hidden w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          className="items-center justify-between w-full lg:flex lg:w-auto lg:order-1"
          id="mobile-menu-2"
        >
          <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-white bg-purple-700 rounded lg:bg-transparent lg:text-purple-700 lg:p-0"
                aria-current="page"
              >
                Explore
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0"
              >
                Borrowed
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0"
              >
                Published
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0"
              >
                How to Use
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
  // <header className="py-10 flex justify-between gap-5">
  //   <a href="/">
  //     <span className="text-2xl xl:text-3xl font-extrabold">Libere.</span>
  //   </a>

  //   <ul className="flex flex-row items-center gap-8">
  //     <li>

  //     </li>
  //   </ul>
  // </header>
};

export default Navbar;
