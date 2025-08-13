import HomeLayout from "../components/layouts/HomeLayout";
import BookList from "../components/BookList";
import { DummyBooks } from "../databases/books.data";

const HomeScreen = () => {
  const latestBooks = DummyBooks;
  return (
    <HomeLayout>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <section className="w-full h-full flex flex-col items-start justify-start max-w-[90vw] px-[4rem] py-[2rem] gap-[1.875rem]">
          <div className="flex flex-col items-center justify-center gap-[1rem] w-full text-center">
            <h1 className="w-[75%] max-w-[50rem] font-bold  text-5xl capitalize text-dark-900">
              BookChain Revolution - Your Books, Your Rules, Your Rewards"
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
      <BookList books={latestBooks.slice(1)} />
    </HomeLayout>
  );
};

export default HomeScreen;
