import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const { authenticated, logout, user } = usePrivy();

  useEffect(() => {
    if (!user) return;

    const userGoogle = user.google;
    if (!userGoogle) return;

    const name = userGoogle.name || userGoogle.email;
    setUsername(name);
  }, [user]);

  const onLogin = () => {
    navigate("/auth");
  };

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-gray-200 py-8">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex flex-row justify-center items-center gap-12">
          <a href="/">
            <span className="text-2xl xl:text-3xl font-extrabold">Libere.</span>
          </a>
          <div className="items-center justify-between flex w-auto">
            <ul className="flex flex-row justify-center items-center space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "block text-zinc-700 font-bold p-0"
                    : "block text-zinc-400 p-0 hover:underline"
                }
              >
                Explore
              </NavLink>
              <NavLink
                to="/publish"
                className={({ isActive }) =>
                  isActive
                    ? "block text-zinc-700 font-bold underline p-0"
                    : "block text-zinc-400 p-0 hover:underline"
                }
              >
                Publish Book
              </NavLink>
            </ul>
          </div>
        </div>

        <div className="flex items-center order-2 gap-8">
          {authenticated && (
            <div className="flex flex-row gap-2 items-center justify-center">
              <p className="capitalize">{username} 👋</p>
            </div>
          )}

          {authenticated ? (
            <button
              onClick={onLogout}
              className="cursor-pointer text-dark-100 bg-white border border-dark-100 hover:bg-zinc-200 font-semibold rounded text-sm px-5 py-2"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="cursor-pointer text-dark-100 bg-white border border-dark-100 hover:bg-zinc-200 font-semibold rounded text-sm px-5 py-2"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
