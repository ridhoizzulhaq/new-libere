import BookCard from "./BookCard";

interface Props {
  books: Book[];
}

const BookList = ({ books }: Props) => {
  if (books.length < 2) return;

  return (
    <section>
      <h2 className="text-2xl font-bold">Book Lists</h2>

      <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 xs:gap-10">
        {books.map((book) => (
          <BookCard key={book.title} {...book} />
        ))}
      </ul>
    </section>
  );
};
export default BookList;
