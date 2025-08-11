import HomeLayout from "../components/layouts/HomeLayout";
import BookList from "../components/BookList";
import { DummyBooks } from "../databases/books.data";

const HomeScreen = () => {
  const latestBooks = DummyBooks;
  return (
    <HomeLayout>
      <BookList
        books={latestBooks.slice(1)}
      />
    </HomeLayout>
  );
};

export default HomeScreen;
