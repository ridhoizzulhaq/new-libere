import HomeLayout from "../components/layouts/HomeLayout";
import BookList from "../components/BookList";
import { FeaturedHero } from "../components/FeaturedHero";
import { useEffect, useState } from "react";
import config from "../libs/config";
import type { Book } from "../core/interfaces/book.interface";

const baseUrl = config.env.supabase.baseUrl;

const HomeScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Removed auth redirect - allow guests to browse store

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
        setBooks([]);
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <HomeLayout>
      {/* Featured Hero Section */}
      <div className="w-full h-full flex flex-col items-center justify-center mt-16">
        {!loading && books.length > 0 && <FeaturedHero book={books[0]} />}
      </div>

      {/* Book List Section */}
      <div className="w-full h-fit flex items-center justify-center mt-8">
        <section className="w-full max-w-screen-xl px-6">
          <BookList books={books} isLoading={loading} />
        </section>
      </div>
    </HomeLayout>
  );
};

export default HomeScreen;
