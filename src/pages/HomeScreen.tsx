import HomeLayout from "../components/layouts/HomeLayout";
import BookList from "../components/BookList";
import { useEffect, useState } from "react";
import config from "../libs/config";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

const baseUrl = config.env.supabase.baseUrl;

const HomeScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { authenticated } = usePrivy();

  useEffect(() => {
    if (!authenticated) navigate("/auth");
  }, [authenticated, navigate]);

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
              Join Us for On Chain E-Book Revolution
            </h1>
            <p className="w-[60%] text-lg text-center">
              Libere focuses on NFT based e-book distribution for both readers
              and libraries. Readers buy for true ownership, while donations add
              copies that directly expand public borrowing capacity. The
              platform provides transparent, royalty-ready, verifiable impact
              for donors, and easy-to-use experience.
            </p>
          </div>
        </section>
      </div>

      <BookList books={books} isLoading={loading} />
    </HomeLayout>
  );
};

export default HomeScreen;
