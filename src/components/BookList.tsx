import BookCard from "./BookCard";

interface Props {
  books: Book[];
  isLoading: boolean;
}

const BookList = ({ books, isLoading }: Props) => {
  return (
    <section className="w-full flex justify-center items-center">
      <div className="w-full">
        <h2 className="text-2xl font-bold">
          📕 Book Lists
        </h2>

        <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 xs:gap-10">
          {books.map((book) => (
            <BookCard key={book.title} {...book} />
          ))}

          {isLoading && (
            <div className="w-full h-full rounded-lg bg-zinc-200 animate-pulse" />
          )}
          {isLoading && (
            <div className="w-full h-full rounded-lg bg-zinc-200 animate-pulse" />
          )}
          {isLoading && (
            <div className="w-full h-full rounded-lg bg-zinc-200 animate-pulse" />
          )}
        </ul>
      </div>
    </section>
  );
};
export default BookList;
