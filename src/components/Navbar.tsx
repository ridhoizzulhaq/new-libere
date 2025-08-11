import { usePrivy } from "@privy-io/react-auth";

const Navbar = () => {
  const { ready, authenticated, logout, user } = usePrivy();
  const disableLogout = !ready || (ready && !authenticated);
  return (
    <header className="py-10 flex justify-between gap-5">
      <a href="/">
        <span className="text-2xl xl:text-3xl font-extrabold">Libere.</span>
      </a>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <button
            disabled={disableLogout}
            onClick={logout}
            className="text-white bg-dark-800 hover:bg-dark-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            {
              authenticated?user?.id:'Logout'
            }
          </button>
        </li>
      </ul>
    </header>
  );
};

export default Navbar;
