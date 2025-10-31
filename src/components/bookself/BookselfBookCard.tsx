/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import BookEpubReaderButton from "../BookEpubReaderButton";
import BookselfTxButton from "./BookselfTxButton";
import { USDC_DECIMALS } from "../../usdc-token";

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

  // Convert USDC units to readable USDC
  const priceInUSDC = Number(book.priceEth) / Math.pow(10, USDC_DECIMALS);

  // Format price: show whole numbers without decimals
  const formattedPrice = priceInUSDC % 1 === 0
    ? priceInUSDC.toString()
    : priceInUSDC.toFixed(2);

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
    <li className="w-full">
      <div
        className="w-full flex flex-col items-center p-5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-200"
      >
        <div className="w-full h-72 bg-zinc-100 rounded flex items-center justify-center">
          {!imageError && book.metadataUri ? (
            <img
              src={book.metadataUri}
              alt={book.title}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                console.error("❌ [Card] Image load failed for book ID:", book.id, "URL:", book.metadataUri);
                setImageError(true);
              }}
              onLoad={() => {
                console.log("✅ [Card] Image loaded successfully for book ID:", book.id);
              }}
            />
          ) : (
            <div className="text-center p-4">
              <svg className="w-16 h-16 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xs text-zinc-500 mt-2">No cover image</p>
            </div>
          )}
        </div>
        <div className="w-full mt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h5 className="text-lg font-semibold tracking-tight text-zinc-900">
                {book.title}
              </h5>
              <p className="line-clamp-1 text-xs text-zinc-500 mt-1">
                {book.author}
              </p>
            </div>
            {/* Quantity Badge - Show if user owns more than 1 */}
            {book.quantity && book.quantity > 1 && (
              <div className="flex-shrink-0 bg-zinc-900 text-white px-2 py-1 rounded text-xs font-semibold">
                ×{book.quantity}
              </div>
            )}
          </div>
          {/* Price Badge - Don't show price in bookshelf since user already owns it */}

          {/* Reading Progress Bar */}
          <div className="w-full mt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-zinc-500 font-medium">Progress</span>
              <span className="text-[11px] font-semibold text-zinc-700">{readingProgress}%</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-zinc-700 to-zinc-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              ></div>
            </div>
          </div>

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
