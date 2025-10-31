import BookCard from "./BookCard";

interface Props {
  books: Book[];
  isLoading: boolean;
}

const BookList = ({ books, isLoading }: Props) => {
  return (
    <section className="w-full flex justify-center items-center">
      <div className="w-full">
        <h2 className="text-2xl font-bold text-zinc-900">
          📕 Book Lists
        </h2>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.title} {...book} />
          ))}

          {isLoading && (
            <div className="w-full h-96 rounded-lg bg-zinc-200 animate-pulse" />
          )}
          {isLoading && (
            <div className="w-full h-96 rounded-lg bg-zinc-200 animate-pulse" />
          )}
          {isLoading && (
            <div className="w-full h-96 rounded-lg bg-zinc-200 animate-pulse" />
          )}
        </ul>
      </div>
    </section>
  );
};
export default BookList;
