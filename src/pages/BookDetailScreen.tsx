import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HomeLayout from "../components/layouts/HomeLayout";
import config from "../libs/config";
import { ethers } from "ethers";
import { ETH_PRICE } from "../core/constants";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { baseSepolia } from "viem/chains";
import { contractABI, contractAddress } from "../smart-contract.abi";
import { encodeFunctionData } from "viem";

const baseUrl = config.env.supabase.baseUrl;

const BookDetailScreen = () => {
  const { id } = useParams();
  const { client } = useSmartWallets();
  const [book, setBook] = useState<Book>();
  const [loading, setLoading] = useState(false);

  const ethPrice = ETH_PRICE;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${baseUrl}/rest/v1/Book?id=eq.${id}`, {
          headers: {
            apiKey: config.env.supabase.apiKey,
          },
        });
        const data = await res.json();

        setBook(data[0]);
      } catch (err) {
        console.error("Failed to get Books Data", err);
      }
    };

    if (id) fetchBooks();
  }, [id]);

  const weiToUSD = (weiValue: string | number | bigint) => {
    const ethAmount = Number(ethers.formatEther(weiValue));
    const usdAmount = ethAmount * ethPrice;
    return Math.round(usdAmount * 100) / 100;
  };

  const onMintBook = async () => {
    setLoading(true);
    if (!client) {
      console.error("No smart account client found");
      setLoading(false);
      return;
    }

    if (!book) {
      console.error("No Book ID");
      setLoading(false);
      return;
    }

    try {
      const id = book.id;
      const amount = 1;

      const tx = await client.sendTransaction({
        chain: baseSepolia,
        to: contractAddress,
        data: encodeFunctionData({
          abi: contractABI,
          functionName: "purchaseItem",
          args: [id, amount],
        }),
      });

      console.log("tx", tx);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Transaction failed:", error);
    }
  };

  return (
    <HomeLayout>
      <div className="mt-4 w-full flex justify-center">
        <div className="container mx-auto px-4 py-8 max-w-screen-xl">
          <div className="flex flex-row -mx-4 gap-8">
            {book ? (
              <div className="w-full md:w-1/2 px-4 py-4 flex items-center justify-center border border-zinc-200 rounded">
                <div className="w-[50%]">
                  <img
                    src={book.metadataUri}
                    alt={book.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full md:w-1/2 h-[32rem] bg-zinc-200 animate-pulse rounded" />
            )}

            <div className="w-full md:w-1/2 px-4">
              {book ? (
                <>
                  <h2 className="text-3xl font-bold">{book.title}</h2>
                  <p className="text-zinc-500 mb-4">ID: {book.id}</p>
                  <p className="text-gray-700 mb-6">{book.description}</p>
                  <div className="mb-2">
                    <span className="text-2xl font-bold">
                      ${weiToUSD(book.priceEth)}
                    </span>
                  </div>
                  <p className="text-zinc-700">
                    <span className="text-sm text-zinc-400">Author:</span>{" "}
                    {book.author}
                  </p>
                  <p className="text-zinc-700 mb-2">
                    <span className="text-sm text-zinc-400">Publisher:</span>{" "}
                    {book.publisher}
                  </p>
                  <div className="flex space-x-4 mt-8">
                    <button
                      className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none"
                      onClick={onMintBook}
                    >
                      {loading ? "Loading..." : "Get Book"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-[12rem] bg-zinc-200 animate-pulse h-[1.875rem] rounded mb-4" />
                  <div className="w-[25rem] bg-zinc-200 animate-pulse h-[5rem] rounded mb-4" />
                  <div className="w-[5rem] bg-zinc-200 animate-pulse h-[2rem] rounded mb-2 mt-2" />
                  <div className="w-[7rem] bg-zinc-200 animate-pulse h-[1.25rem] rounded mb-6" />
                  <div className="w-[5rem] bg-zinc-200 animate-pulse h-[2rem] rounded" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default BookDetailScreen;
