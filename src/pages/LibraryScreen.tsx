import HomeLayout from "../components/layouts/HomeLayout";
import { useEffect, useState } from "react";
import config from "../libs/config";
import CivilibBookList from "../components/civilib/CivilibBookList";

const baseUrl = config.env.supabase.baseUrl;

const LibraryScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nftBooks, setNftBooks] = useState<Book[]>([]);

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

        const res = await fetch(config.env.baseSepolia.url);
        const data = await res.json();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids: string[] = data.items.map((i:any) => i.id);
        const filteredBooks = books.filter((book) => ids.includes(String(book.id)));

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
          style={{ backgroundImage: "url('/images/auth-illustration.png')" }}
        >
          <div className="absolute inset-0 bg-black/70 rounded-lg"></div>
          <div className="relative z-10 flex flex-col gap-4 text-white">
            <h2 className="text-5xl font-extrabold">Library</h2>
            <p className="text-lg max-w-2xl">
              Experience the future of digital libraries where readers control
              the ecosystem. Borrow, lend, and discover books while earning
              rewards through our innovative blockchain system. Every page
              turned, every book shared transparently recorded forever.
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
