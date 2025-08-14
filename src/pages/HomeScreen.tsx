import HomeLayout from "../components/layouts/HomeLayout";
import BookList from "../components/BookList";
import { useEffect, useState } from "react";
import config from "../libs/config";

const baseUrl = config.env.supabase.baseUrl;

const HomeScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <HomeLayout>
      <div className="w-full h-full flex flex-col items-center justify-center mt-8">
        <section className="max-w-screen-xl h-fit flex flex-col px-[4rem] py-[2rem] mb-[4rem]">
          <div className="flex flex-col items-center justify-center gap-[1rem] w-full text-center">
            <h1 className="w-[70%] font-bold text-5xl leading-snug text-center">
              Libere Revolution Your Books, Your Rules, Your Rewards
            </h1>
            <p className="w-[60%] text-lg text-center">
              Experience the future of digital libraries where readers control
              the ecosystem. Borrow, lend, and discover books while earning
              rewards through our innovative blockchain system. Every page
              turned, every book shared - transparently recorded forever.
            </p>
          </div>
        </section>
      </div>

      <BookList books={books} isLoading={loading} />
    </HomeLayout>
  );
};

export default HomeScreen;
