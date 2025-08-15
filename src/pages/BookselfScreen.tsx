import HomeLayout from "../components/layouts/HomeLayout";
import { useEffect, useState } from "react";
import config from "../libs/config";
import { useNavigate } from "react-router-dom";
import BookselfBookList from "../components/bookself/ BookselfBookList";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

const baseUrl = config.env.supabase.baseUrl;

const BookselfScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nftBooks, setNftBooks] = useState<Book[]>([]);

  const { client } = useSmartWallets();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${baseUrl}/rest/v1/Book`, {
          headers: {
            apiKey: config.env.supabase.apiKey,
          },
        });
        const data = await res.json();

        setBooks(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to get Books Data", err);
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    if (!books && !client) return;

    if(!client?.account) return;

    const fetchBookself = async () => {
      try {
        setLoading(true);

        const clientAddress = client?.account.address;

        const res = await fetch(
          'https://base-sepolia.blockscout.com/api/v2/addresses/' + clientAddress + "/nft?type=ERC-1155"
        );
        const data = await res.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids: string[] = data.items.map((i: any) => i.id);
        const filteredBooks = books.filter((book) =>
          ids.includes(String(book.id))
        );

        setNftBooks(filteredBooks);
        setLoading(false);
      } catch (err) {
        console.error("Failed to get Books Data", err);
        setLoading(false);
      }
    };

    fetchBookself();
  }, [books, client]);

  const navigate = useNavigate();
  return (
    <HomeLayout>
      <div className="w-full h-full flex items-center justify-center mt-12">
        <section
          className="w-full flex justify-start items-center rounded-lg relative max-w-screen-xl p-12 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/auth-illustration.png')" }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-lg"></div>
          <div className="relative z-10 flex flex-col gap-4 text-white">
            <button
              onClick={() => navigate("/books")}
              className="cursor-pointer hover:underline w-fit"
            >
              &larr; Back
            </button>
            <h2 className="text-5xl font-extrabold">My Bookself</h2>
            <p className="text-lg max-w-2xl">
              Your personal space to view, track, and enjoy books you own or
              borrow — all in one organized collection, ready anytime whether
              digital, physical, or from the community.
            </p>
          </div>
        </section>
      </div>
      <div className="w-full h-fit flex items-center justify-center mt-12 ">
        <section className="w-full max-w-screen-xl">
          <BookselfBookList books={nftBooks} isLoading={loading} />
        </section>
      </div>
    </HomeLayout>
  );
};

export default BookselfScreen;
