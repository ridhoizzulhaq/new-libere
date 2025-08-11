import { usePrivy } from "@privy-io/react-auth";

const Navbar = () => {
  const { ready, authenticated, logout } = usePrivy();
  const disableLogout = !ready || (ready && !authenticated);
  return (
    <header className="my-10 flex justify-between gap-5">
      <a href="/">
        <img src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </a>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <button
            disabled={disableLogout}
            onClick={logout}
            className={`px-4 py-2 rounded ${
              disableLogout
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Logout
          </button>
        </li>
      </ul>
    </header>
  );
};

export default Navbar;
