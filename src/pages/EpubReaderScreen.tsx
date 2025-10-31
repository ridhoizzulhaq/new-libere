import { useParams, useNavigate } from "react-router-dom";
import { ReactReader } from "react-reader";
import { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaBookOpen, FaBookmark, FaRegBookmark } from "react-icons/fa";
import WatermarkOverlay from "../components/reader/WatermarkOverlay";

const EpubReaderScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookId = id || "unknown";

  console.log("📖 [Reader] Book ID from params:", bookId, "Type:", typeof bookId);

  const [location, setLocation] = useState<string | number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [bookTitle, setBookTitle] = useState<string>("Reading...");
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [readingMode, setReadingMode] = useState<"paginated" | "scrolled">(
    (localStorage.getItem(`reading-mode-${bookId}`) as "paginated" | "scrolled") || "paginated"
  );
  const renditionRef = useRef<any>(null);
  const [locationsReady, setLocationsReady] = useState<boolean>(false);

  // Load saved location and bookmark from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem(`book-location-${bookId}`);
    const savedProgress = localStorage.getItem(`book-progress-${bookId}`);
    const savedBookmark = localStorage.getItem(`book-bookmark-${bookId}`);

    if (savedLocation) {
      setLocation(savedLocation);
    }
    if (savedProgress) {
      setProgress(parseInt(savedProgress, 10));
    }
    if (savedBookmark) {
      setIsBookmarked(true);
    }
  }, [bookId]);

  // Check if current page is bookmarked
  useEffect(() => {
    const currentLocation = location.toString();
    const savedBookmark = localStorage.getItem(`book-bookmark-${bookId}`);
    setIsBookmarked(savedBookmark === currentLocation);
  }, [location, bookId]);

  // Recalculate progress whenever location changes and locations are ready
  useEffect(() => {
    if (locationsReady && location && location !== 0) {
      console.log("📍 [Reader] Location state changed, recalculating progress...");
      console.log("   Current location:", location);
      setTimeout(() => calculateProgress(), 300);
    }
  }, [location, locationsReady]);

  // Calculate progress from current location
  const calculateProgress = () => {
    console.log("🔄 [calculateProgress] Starting calculation...");

    if (!renditionRef.current || !locationsReady) {
      console.log("⚠️ Progress calculation skipped - not ready", {
        hasRendition: !!renditionRef.current,
        locationsReady
      });
      return;
    }

    try {
      const rendition = renditionRef.current;
      const book = rendition.book;

      console.log("📚 Book object:", {
        hasBook: !!book,
        hasLocations: !!book?.locations,
        totalLocations: book?.locations?.total
      });

      if (!book || !book.locations || !book.locations.total) {
        console.log("⚠️ Book locations not available yet");
        return;
      }

      // Get current location - try multiple methods
      let currentCfi = location.toString();

      // If location is still default, try to get from rendition
      if (!currentCfi || currentCfi === "0") {
        console.log("⚠️ Location is 0, trying to get from rendition.location()");
        try {
          const currentLocation = rendition.currentLocation();
          if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
            currentCfi = currentLocation.start.cfi;
            console.log("✅ Got CFI from currentLocation:", currentCfi);
          }
        } catch (e) {
          console.log("❌ Could not get currentLocation:", e);
        }
      }

      if (!currentCfi || currentCfi === "0") {
        console.log("❌ No valid location yet");
        return;
      }

      console.log("📍 Using CFI:", currentCfi);

      // Use locations.percentageFromCfi to get accurate percentage
      const percentage = book.locations.percentageFromCfi(currentCfi);

      console.log("📊 Percentage result:", percentage);

      if (percentage !== null && percentage !== undefined) {
        const progressPercent = Math.round(percentage * 100);
        const storageKey = `book-progress-${bookId}`;

        console.log("✅ Progress calculated:", progressPercent + "%", {
          bookId,
          storageKey,
          currentCfi,
          percentage
        });

        setProgress(progressPercent);
        localStorage.setItem(storageKey, progressPercent.toString());

        console.log(`💾 Saved to localStorage: ${storageKey} = ${progressPercent}`);
        console.log(`🔍 Verify saved:`, localStorage.getItem(storageKey));

        // Dispatch custom event for cross-component updates
        window.dispatchEvent(new CustomEvent('progressUpdate', {
          detail: { bookId: bookId, progress: progressPercent }
        }));

        console.log(`📢 Dispatched progressUpdate event for bookId: ${bookId}`);
      } else {
        console.log("❌ Could not calculate percentage from CFI");
      }
    } catch (error) {
      console.error("❌ Error calculating progress:", error);
    }
  };

  // Handle location changes and save progress
  const handleLocationChanged = (epubcfi: string) => {
    console.log("📍 [handleLocationChanged] Location changed:", epubcfi);
    console.log("   locationsReady:", locationsReady);
    console.log("   renditionRef:", !!renditionRef.current);

    setLocation(epubcfi);

    // Save location to localStorage immediately
    localStorage.setItem(`book-location-${bookId}`, epubcfi);
    console.log("💾 [handleLocationChanged] Saved location to localStorage");

    // Calculate and update progress
    if (locationsReady && renditionRef.current) {
      setTimeout(() => {
        console.log("⏱️ [handleLocationChanged] Triggering progress calculation...");
        calculateProgress();
      }, 300);
    } else {
      console.log("⚠️ [handleLocationChanged] Skipping calculation - not ready yet");
    }
  };

  const handleBack = () => {
    navigate("/bookselfs");
  };

  // Handle reading mode change
  const handleReadingModeChange = (mode: "paginated" | "scrolled") => {
    setReadingMode(mode);
    localStorage.setItem(`reading-mode-${bookId}`, mode);
    console.log("📖 Reading mode changed to:", mode);

    // Auto-refresh page to apply new reading mode
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!renditionRef.current || !locationsReady) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

    try {
      // Navigate to percentage in the book
      const { book } = renditionRef.current;
      if (book && book.locations) {
        const cfi = book.locations.cfiFromPercentage(percentage / 100);
        renditionRef.current.display(cfi);
      }
    } catch (error) {
      console.error("Error jumping to location:", error);
    }
  };

  // Handle progress bar hover
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.round(Math.max(0, Math.min(100, (hoverX / rect.width) * 100)));
    setHoverProgress(percentage);
    setHoverPosition(hoverX);
  };

  const handleProgressLeave = () => {
    setHoverProgress(null);
    setHoverPosition(0);
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    const currentLocation = location.toString();

    if (isBookmarked) {
      // Remove bookmark
      localStorage.removeItem(`book-bookmark-${bookId}`);
      setIsBookmarked(false);
    } else {
      // Add bookmark
      localStorage.setItem(`book-bookmark-${bookId}`, currentLocation);
      setIsBookmarked(true);
    }
  };

  // Jump to bookmark
  const handleJumpToBookmark = () => {
    const savedBookmark = localStorage.getItem(`book-bookmark-${bookId}`);
    if (savedBookmark && renditionRef.current) {
      renditionRef.current.display(savedBookmark);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="h-6 w-px bg-zinc-300"></div>

              <div className="flex items-center gap-2">
                <FaBookOpen className="text-zinc-500 text-sm" />
                <span className="text-sm font-semibold text-zinc-900">{bookTitle}</span>
              </div>
            </div>

            {/* Right: Progress indicator and bookmark */}
            <div className="flex items-center gap-4">
              {/* Reading mode toggle */}
              <div className="flex items-center gap-1 border border-zinc-200 rounded-lg p-1">
                <button
                  onClick={() => handleReadingModeChange("paginated")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    readingMode === "paginated"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                  title="Page turning mode"
                >
                  📖 Page
                </button>
                <button
                  onClick={() => handleReadingModeChange("scrolled")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    readingMode === "scrolled"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                  title="Vertical scroll mode"
                >
                  📜 Scroll
                </button>
              </div>

              <div className="h-6 w-px bg-zinc-300"></div>

              {/* Bookmark buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                  title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  {isBookmarked ? (
                    <FaBookmark className="text-sm" />
                  ) : (
                    <FaRegBookmark className="text-sm" />
                  )}
                </button>

                {localStorage.getItem(`book-bookmark-${bookId}`) && (
                  <button
                    onClick={handleJumpToBookmark}
                    className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-xs font-medium transition-colors"
                    title="Jump to bookmark"
                  >
                    Go to bookmark
                  </button>
                )}
              </div>

              <div className="h-6 w-px bg-zinc-300"></div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 relative">
                <div
                  onClick={handleProgressClick}
                  onMouseMove={handleProgressHover}
                  onMouseLeave={handleProgressLeave}
                  className={`w-48 bg-zinc-200 rounded-full h-2 transition-colors relative group ${
                    locationsReady ? "cursor-pointer hover:bg-zinc-300" : "cursor-not-allowed opacity-50"
                  }`}
                  title={locationsReady ? "Click to jump to position" : "Loading book locations..."}
                >
                  <div
                    className="bg-zinc-900 h-2 rounded-full transition-all duration-300 group-hover:bg-zinc-800"
                    style={{ width: `${progress}%` }}
                  ></div>

                  {/* Hover tooltip */}
                  {hoverProgress !== null && locationsReady && (
                    <div
                      className="absolute -top-8 bg-zinc-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transform -translate-x-1/2 pointer-events-none"
                      style={{ left: `${hoverPosition}px` }}
                    >
                      {hoverProgress}%
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-zinc-700 min-w-[3rem]">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reader */}
      <div className="flex-1 bg-white relative">
        <ReactReader
          url="https://react-reader.metabits.no/files/alice.epub"
          location={location}
          locationChanged={handleLocationChanged}
          epubOptions={{
            flow: readingMode === "scrolled" ? "scrolled" : "paginated",
            manager: readingMode === "scrolled" ? "continuous" : "default",
          }}
          getRendition={(rendition: any) => {
            renditionRef.current = rendition;
            console.log("📖 [getRendition] Rendition loaded");

            // Get book metadata
            if (rendition?.book?.packaging?.metadata?.title) {
              setBookTitle(rendition.book.packaging.metadata.title);
              console.log("📚 Book title set:", rendition.book.packaging.metadata.title);
            }

            // Generate locations for navigation
            const book = rendition.book;
            if (book) {
              book.ready.then(() => {
                console.log("📖 Book ready, generating locations...");
                return book.locations.generate(1024); // Generate locations
              }).then((locations: any) => {
                console.log("✅ Locations generated:", locations.length, "points");
                setLocationsReady(true);

                // Calculate initial progress after locations are ready
                setTimeout(() => {
                  console.log("🔄 Calculating initial progress...");
                  calculateProgress();
                }, 1000);
              }).catch((err: any) => {
                console.error("❌ Error generating locations:", err);
              });
            }

            // Listen for relocated event to update progress (MOST IMPORTANT)
            console.log("🎯 [getRendition] Setting up 'relocated' event listener...");
            rendition.on('relocated', (location: any) => {
              console.log("🔄 [relocated] ===== Event triggered =====", {
                start: location?.start?.cfi,
                end: location?.end?.cfi,
                percentage: location?.start?.percentage,
                timestamp: new Date().toISOString()
              });

              // Update location state immediately
              if (location?.start?.cfi) {
                const cfi = location.start.cfi;
                console.log("📍 [relocated] Updating location to:", cfi);
                setLocation(cfi);
                localStorage.setItem(`book-location-${bookId}`, cfi);
                console.log("💾 [relocated] Saved location to localStorage");
              }

              // Calculate progress after state update
              setTimeout(() => {
                console.log("⏱️ [relocated] Calculating progress...");
                calculateProgress();
              }, 100);
            });
            console.log("✅ [getRendition] 'relocated' event listener attached");

            // Listen for rendered event
            rendition.on('rendered', () => {
              console.log("🎨 [rendered] Page rendered");
              setTimeout(() => {
                console.log("⏱️ Calculating progress from rendered event...");
                calculateProgress();
              }, 100);
            });

            // Listen for page turn events
            rendition.on('displayedPages', (pages: any) => {
              console.log("📄 [displayedPages] Pages displayed:", pages);
            });

            console.log("✅ All event listeners attached to rendition");
          }}
        />
        <WatermarkOverlay isEnabled={true} />
      </div>
    </div>
  );
};

export default EpubReaderScreen;
