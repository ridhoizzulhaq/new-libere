import { FaBookReader } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  book: Book;
}

/**
 * Universal Book Reader Button
 * Supports both EPUB and PDF formats
 * Navigates to appropriate reader based on book.fileType
 */
const BookEpubReaderButton = ({ book }: Props) => {
  const navigate = useNavigate();

  const onReadBook = () => {
    // Determine reader route based on file type
    // Default to EPUB for backward compatibility
    const fileType = book.fileType || 'epub';

    if (fileType === 'pdf') {
      navigate(`/read-pdf/${book.id}`);
    } else {
      navigate(`/read-book/${book.id}`);
    }
  };

  return (
    <button
      onClick={onReadBook}
      className="cursor-pointer flex flex-row gap-1.5 justify-center items-center w-full bg-white border border-dark-100 text-dark-100 px-2.5 py-1.5 rounded text-xs font-medium disabled:bg-zinc-200 disabled:cursor-not-allowed disabled:border-none disabled:text-zinc-400 transition-colors"
    >
      <FaBookReader className="text-sm" />
      <span>Read Book</span>
    </button>
  );
};

export default BookEpubReaderButton;
