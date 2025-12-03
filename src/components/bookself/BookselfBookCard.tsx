/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import BookEpubReaderButton from "../BookEpubReaderButton";
import AudiobookButton from "../AudiobookButton";
import GoToCommunityButton from "./GoToCommunityButton";
import BookselfTxButton from "./BookselfTxButton";

interface Props {
  book: Book;
  client: any;
  clientPublic: any;
}

const BookselfBookCard = ({ book, client }: Props) => {
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);

  console.log("📚 [Card] Rendering for book ID:", book.id, "Type:", typeof book.id);
  console.log("📸 [Card] Image URL:", book.metadataUri);

  // Convert USDC units to readable USDC (unused in bookshelf display)
  // const priceInUSDC = Number(book.priceEth) / Math.pow(10, USDC_DECIMALS);

  // Load real reading progress from localStorage
  useEffect(() => {
    const loadProgress = () => {
      const storageKey = `book-progress-${book.id}`;
      const savedProgress = localStorage.getItem(storageKey);

      console.log(`📚 [Card ${book.id}] Loading progress...`);
      console.log(`   Storage key: ${storageKey}`);
      console.log(`   Saved value: ${savedProgress}`);
      console.log(`   All localStorage keys:`, Object.keys(localStorage).filter(k => k.includes('progress')));

      if (savedProgress) {
        const progress = parseInt(savedProgress, 10);
        console.log(`✅ [Card ${book.id}] Setting progress to: ${progress}%`);
        setReadingProgress(progress);
      } else {
        // Default to 0% if no progress saved
        console.log(`⚠️ [Card ${book.id}] No saved progress, defaulting to 0%`);
        setReadingProgress(0);
      }
    };

    // Load progress initially AND every time component mounts/updates
    console.log(`🔄 [Card ${book.id}] Component mounted/updated - loading progress...`);
    loadProgress();

    // Listen for storage changes (when progress updates in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      const expectedKey = `book-progress-${book.id}`;
      console.log(`📡 [Card ${book.id}] Storage event:`, { key: e.key, newValue: e.newValue });

      if (e.key === expectedKey && e.newValue) {
        const progress = parseInt(e.newValue, 10);
        console.log(`✅ [Card ${book.id}] Storage event - updating to: ${progress}%`);
        setReadingProgress(progress);
      }
    };

    // Custom event listener for same-window updates
    const handleProgressUpdate = (e: CustomEvent) => {
      console.log(`📡 [Card ${book.id}] Custom event received:`, e.detail);

      // Handle both string and number comparison
      if (String(e.detail.bookId) === String(book.id)) {
        console.log(`✅ [Card ${book.id}] Custom event - updating to: ${e.detail.progress}%`);
        setReadingProgress(e.detail.progress);
      } else {
        console.log(`⚠️ [Card ${book.id}] Event bookId mismatch:`, {
          eventBookId: e.detail.bookId,
          cardBookId: book.id,
          eventBookIdType: typeof e.detail.bookId,
          cardBookIdType: typeof book.id
        });
      }
    };

    // Reload progress when page becomes visible (returning from reader)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log(`👀 [Card ${book.id}] Page visible - reloading progress`);
        loadProgress();
      }
    };

    // Reload on window focus (additional safety)
    const handleFocus = () => {
      console.log(`🎯 [Card ${book.id}] Window focused - reloading progress`);
      loadProgress();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('progressUpdate' as any, handleProgressUpdate as any);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Poll for changes every 3 seconds (fallback)
    const interval = setInterval(() => {
      console.log(`⏰ [Card ${book.id}] Polling progress...`);
      loadProgress();
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('progressUpdate' as any, handleProgressUpdate as any);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [book.id]);

  return (
    <li className="w-full h-full">
      <div
        className="group w-full h-full flex flex-col rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <div className="relative w-full h-56 bg-zinc-100 flex-shrink-0">
          {!imageError && book.metadataUri ? (
            <img
              src={book.metadataUri}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => {
                console.error("❌ [Card] Image load failed for book ID:", book.id, "URL:", book.metadataUri);
                setImageError(true);
              }}
              onLoad={() => {
                console.log("✅ [Card] Image loaded successfully for book ID:", book.id);
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center p-4">
              <div>
                <svg className="w-12 h-12 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xs text-zinc-500 mt-1.5">No cover image</p>
              </div>
            </div>
          )}
        </div>
        <div className="w-full p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 min-h-[3.5rem]">
            <div className="flex-1 min-w-0">
              <h5 className="text-base font-semibold tracking-tight text-zinc-900 line-clamp-2 leading-tight">
                {book.title}
              </h5>
              <p className="line-clamp-1 text-xs text-zinc-500 mt-0.5">
                {book.author}
              </p>
            </div>
            {/* Right side: Quantity Badge + Transfer Button */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* Quantity Badge - Show if user owns more than 1 */}
              {book.quantity && book.quantity > 1 && (
                <div className="bg-zinc-900 text-white px-2 py-1 rounded text-xs font-semibold">
                  ×{book.quantity}
                </div>
              )}
              {/* Transfer Button */}
              <BookselfTxButton client={client} book={book} />
            </div>
          </div>
          {/* Reading Progress Bar */}
          <div className="w-full mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-zinc-500 font-medium">Progress</span>
              <span className="text-[10px] font-semibold text-zinc-700">{readingProgress}%</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-zinc-700 to-zinc-900 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-1.5 mt-auto pt-3">
            <BookEpubReaderButton book={book} />
            {book.audiobook && <AudiobookButton book={book} />}
            <GoToCommunityButton book={book} />
          </div>
        </div>
      </div>
    </li>
  );
};

export default BookselfBookCard;
