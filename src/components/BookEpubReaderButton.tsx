import { FaBookReader } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  book: Book;
}
const BookEpubReaderButton = ({ book }: Props) => {
  const navigate = useNavigate();

  const onReadBook = () => {
    navigate(`/read-book/${book.id}`);
  };
  return (
    <button
      onClick={onReadBook}
      className="cursor-pointer flex flex-row gap-2 justify-center items-center w-full bg-white border border-dark-100 text-dark-100 px-2.5 py-[.25rem] rounded-sm disabled:bg-zinc-200 disabled:cursor-not-allowed
                  disabled:border-none disabled:text-zinc-400"
    >
      <FaBookReader />
      <div>Read Book</div>
    </button>
  );
};

export default BookEpubReaderButton;
