import { FaHeadphones } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  book: Book;
}

/**
 * Audiobook Button Component
 * Navigates to dedicated audiobook player screen
 * Only shown for books with audiobook field populated
 */
const AudiobookButton = ({ book }: Props) => {
  const navigate = useNavigate();

  const onListenAudiobook = () => {
    navigate(`/listen-audiobook/${book.id}`);
  };

  return (
    <button
      onClick={onListenAudiobook}
      className="cursor-pointer flex flex-row gap-1.5 justify-center items-center w-full bg-white border border-amber-500 text-amber-600 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-amber-50 disabled:bg-zinc-200 disabled:cursor-not-allowed disabled:border-none disabled:text-zinc-400 transition-colors"
    >
      <FaHeadphones className="text-sm" />
      <span>Listen to Audiobook</span>
    </button>
  );
};

export default AudiobookButton;
