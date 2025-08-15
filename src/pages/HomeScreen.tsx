import HomeLayout from "../components/layouts/HomeLayout";
import BookList from "../components/BookList";
import { useEffect, useState } from "react";
import config from "../libs/config";
import { NavLink, useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { PiHandDepositBold } from "react-icons/pi";
import { GiBookshelf } from "react-icons/gi";


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
        <section className="max-w-screen-xl h-fit flex flex-col px-[4rem] py-[2rem] mb-[1rem]">
          <div className="flex flex-col items-center justify-center gap-[1rem] w-full text-center">
            <h1 className="w-[80%] font-bold text-5xl leading-snug text-center">
              Join Us for On Chain E-Book Revolution
            </h1>
            <p className="w-[80%] text-lg text-center">
              Libere focuses on NFT based e-book distribution for both readers
              and libraries. Readers buy for true ownership, while donations add
              copies that directly expand public borrowing capacity. The
              platform provides transparent, royalty-ready, verifiable impact
              for donors, and easy-to-use experience.
            </p>
          </div>
        </section>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-screen-xl h-full flex flex-row gap-5 justify-center items-center">
          <NavLink
            to={"/libraries"}
            className="w-full flex justify-start items-center rounded-lg relative p-12 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/bookself.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-lg"></div>
            <div className="relative z-10 flex flex-col gap-4 text-white">
              <h2 className="text-5xl font-extrabold flex flex-row gap-3"><GiBookshelf />Library</h2>
              <p className="text-lg max-w-2xl">
                An on-chain public library where donor-funded copies determine
                borrowing capacity, enabling free, time-limited access with
                transparent, audit-ready impact.
              </p>
            </div>
          </NavLink>
          <NavLink
            to={"/publish"}
            className="w-full flex justify-start items-center rounded-lg relative p-12 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/book.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-lg"></div>
            <div className="relative z-10 flex flex-col gap-4 text-white">
              <h2 className="text-5xl font-extrabold flex flex-row gap-3"><PiHandDepositBold />Publish Book</h2>
              <p className="text-lg max-w-2xl">
                Share your books with the world by publishing them on-chain,
                allowing readers to access, borrow, and enjoy your creations
                transparently and securely.
              </p>
            </div>
          </NavLink>
        </div>
      </div>

      <div className="w-full h-fit flex items-center justify-center mt-12 ">
        <section className="w-full max-w-screen-xl">
          <BookList books={books} isLoading={loading} />
        </section>
      </div>
    </HomeLayout>
  );
};

export default HomeScreen;
