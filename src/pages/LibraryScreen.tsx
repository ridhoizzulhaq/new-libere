import HomeLayout from "../components/layouts/HomeLayout";
import { useEffect, useState } from "react";
import config from "../libs/config";
import CivilibBookList from "../components/civilib/CivilibBookList";
import { useNavigate } from "react-router-dom";

const baseUrl = config.env.supabase.baseUrl;

const LibraryScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nftBooks, setNftBooks] = useState<Book[]>([]);

  const navigate = useNavigate();

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
    const fetchCivilib = async () => {
      try {
        setLoading(true);

        const res = await fetch('https://base-sepolia.blockscout.com/api/v2/addresses/0x584f1c676445707E3AF1A16b4B78186E445A8C93/nft?type=ERC-1155');
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
    fetchCivilib();
  }, [books]);

  return (
    <HomeLayout>
      <div className="w-full h-full flex items-center justify-center mt-12">
        <section
          className="w-full flex justify-start items-center rounded-lg relative max-w-screen-xl p-12 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/bookself.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-lg"></div>
          <div className="relative z-10 flex flex-col gap-4 text-white">
            <button
              onClick={() => navigate("/books")}
              className="cursor-pointer hover:underline w-fit"
            >
              &larr; Back
            </button>
            <h2 className="text-5xl font-extrabold">Library</h2>
            <p className="text-lg max-w-2xl">
              An on-chain public library where donor-funded copies determine
              borrowing capacity, enabling free, time-limited access with
              transparent, audit-ready impact.
            </p>
          </div>
        </section>
      </div>

      <div className="w-full h-fit flex items-center justify-center mt-12 ">
        <section className="w-full max-w-screen-xl">
          <CivilibBookList books={nftBooks} isLoading={loading} />
        </section>
      </div>
    </HomeLayout>
  );
};

export default LibraryScreen;
