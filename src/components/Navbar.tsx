import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import config from "../libs/config";
import { FaUserCircle, FaCopy, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const baseUrl = config.env.baseSepolia.baseUrl;

  const { client } = useSmartWallets();

  const { authenticated, logout, user } = usePrivy();

  useEffect(() => {
    if (!user) return;

    const userGoogle = user.google;
    if (!userGoogle) return;

    const name = userGoogle.name || userGoogle.email || "User";
    const userEmail = userGoogle.email || "";
    setUsername(name);
    setEmail(userEmail);
  }, [user]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const onLogin = () => {
    navigate("/auth");
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${baseUrl}${client!.account.address}/tokens?type=ERC-20`
        );
        const data = await res.json();

        console.log("balance", data);

        const usdcItem = data.items.find(
          (item: { token: { symbol: string; }; }) => item.token?.symbol === "USDC"
        );

        if (usdcItem) {
          const rawValue = usdcItem.value; // e.g. "10000000"
          const decimals = Number(usdcItem.token.decimals); // e.g. 6
          const parsed = Number(rawValue) / 10 ** decimals;

          setUsdcBalance(parsed); // simpan ke state
        } else {
          setUsdcBalance(0); // kalau nggak ada USDC
        }
      } catch (err) {
        console.error("Failed to get balance", err);
        setUsdcBalance(null);
      } finally {
        setLoading(false);
      }
    };

    if (client?.account?.address) {
      fetchBalance();
    }
  }, [baseUrl, client, client?.account?.address]);

  const onLogout = () => {
    logout();
    navigate("/");
  };

  const copyAddress = () => {
    if (client?.account?.address) {
      navigator.clipboard.writeText(client.account.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <nav className="sticky top-0 bg-white z-50 py-5 border-b border-zinc-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto px-6">
        <div className="flex flex-row justify-center items-center gap-16">
          <a href="/books" className="flex items-center gap-2">
            <img src="/images/libere-logo.png" alt="Libere" className="h-8" />
          </a>
          <div className="items-center justify-between flex w-auto">
            <ul className="flex flex-row justify-center items-center space-x-10">
              <NavLink
                to="/books"
                className={({ isActive }) =>
                  isActive
                    ? "block text-zinc-900 font-semibold text-sm border-b-2 border-zinc-900 pb-1"
                    : "block text-zinc-500 text-sm hover:text-zinc-900 transition-colors pb-1"
                }
              >
                Store
              </NavLink>
              {authenticated && (
                <>
                  <NavLink
                    to="/libraries"
                    className={({ isActive }) =>
                      isActive
                        ? "block text-zinc-900 font-semibold text-sm border-b-2 border-zinc-900 pb-1"
                        : "block text-zinc-500 text-sm hover:text-zinc-900 transition-colors pb-1"
                    }
                  >
                    Library
                  </NavLink>
                  <NavLink
                    to="/bookselfs"
                    className={({ isActive }) =>
                      isActive
                        ? "block text-zinc-900 font-semibold text-sm border-b-2 border-zinc-900 pb-1"
                        : "block text-zinc-500 text-sm hover:text-zinc-900 transition-colors pb-1"
                    }
                  >
                    My Bookself
                  </NavLink>
                  {/* Temporarily hidden - Publish Book link */}
                  {/* <NavLink
                    to="/publish"
                    className={({ isActive }) =>
                      isActive
                        ? "block text-zinc-900 font-semibold text-sm border-b-2 border-zinc-900 pb-1"
                        : "block text-zinc-500 text-sm hover:text-zinc-900 transition-colors pb-1"
                    }
                  >
                    Publish Book
                  </NavLink> */}
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex items-center order-2 gap-3">
          {authenticated ? (
            client ? (
              // Account dropdown - Wallet is ready
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <FaUserCircle className="text-zinc-600 text-xl" />
                  <span className="text-sm font-medium text-zinc-900">{username}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-sm font-semibold text-zinc-900">{username}</p>
                      {email && (
                        <p className="text-xs text-zinc-500 mt-0.5">{email}</p>
                      )}
                    </div>

                    {/* Wallet Address */}
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-[11px] text-zinc-500 font-medium mb-1">Wallet Address</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-mono text-zinc-900">
                          {client.account.address.slice(0, 8)}...{client.account.address.slice(-6)}
                        </p>
                        <button
                          onClick={copyAddress}
                          className="p-1.5 hover:bg-zinc-100 rounded transition-colors"
                          title="Copy address"
                        >
                          <FaCopy className={`text-xs ${copySuccess ? "text-green-600" : "text-zinc-500"}`} />
                        </button>
                      </div>
                      {copySuccess && (
                        <p className="text-[10px] text-green-600 mt-1">Copied!</p>
                      )}
                    </div>

                    {/* USDC Balance */}
                    {usdcBalance !== null && !loading && (
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-[11px] text-zinc-500 font-medium mb-1">Balance</p>
                        <p className="text-sm font-semibold text-zinc-900">
                          {usdcBalance.toLocaleString()} USDC
                        </p>
                      </div>
                    )}

                    {/* Logout Button */}
                    <div className="px-4 py-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded transition-colors"
                      >
                        <FaSignOutAlt className="text-xs" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Loading wallet - No manual button needed
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900"></div>
                <span>Setting up wallet...</span>
              </div>
            )
          ) : (
            // Login button - Bold and prominent for guests
            <button
              onClick={onLogin}
              className="cursor-pointer text-white bg-zinc-900 hover:bg-zinc-800 font-bold rounded-lg text-base px-6 py-2.5 transition-all shadow-md hover:shadow-lg"
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
