/* eslint-disable @typescript-eslint/no-explicit-any */
import BookEpubReaderButton from "../BookEpubReaderButton";
import BookselfTxButton from "./BookselfTxButton";

interface Props {
  book: Book;
  client: any;
  clientPublic: any;
}

const BookselfBookCard = ({ book, client }: Props) => {
  return (
    <li className="w-full">
      <div
        className="w-full flex flex-col items-center p-4 rounded border border-zinc-200"
      >
        <div className="flex">
          <div className="w-full h-64">
            <img
              src={book.metadataUri}
              alt={book.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>
        <div className="w-full mt-2">
          <h5 className="text-xl font-semibold tracking-tight text-gray-900">
            {book.title}
          </h5>
          <p className="line-clamp-1 text-sm italic text-zinc-400">
            {book.author}
          </p>
          <div className="w-full flex flex-col items-center gap-2 justify-between mt-3">
            <BookEpubReaderButton book={book} />
            <BookselfTxButton client={client} book={book} />
          </div>
        </div>
      </div>
    </li>
  );
};

export default BookselfBookCard;
