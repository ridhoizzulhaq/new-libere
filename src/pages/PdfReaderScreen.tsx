import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaArrowLeft, FaBookOpen, FaBookmark, FaRegBookmark } from "react-icons/fa";
import WatermarkOverlay from "../components/reader/WatermarkOverlay";
import PdfViewer from "../components/reader/PdfViewer";
import { supabase } from "../libs/supabase";
import { isSupabaseStorageUrl } from "../utils/supabaseStorage";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { contractABI, contractAddress } from "../smart-contract.abi";
import { libraryPoolABI, libraryPoolAddress } from "../library-pool.abi";

console.log('📄 [PdfReaderScreen] Loaded - PDF reader with NFT + Library verification');

const PdfReaderScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookId = id || "unknown";
  const { user, authenticated } = usePrivy();

  console.log("📖 [PDF Reader] Book ID from params:", bookId, "Type:", typeof bookId);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ownsNFT, setOwnsNFT] = useState<boolean | null>(null);
  const [hasBorrowed, setHasBorrowed] = useState<boolean | null>(null);
  const [borrowExpiry, setBorrowExpiry] = useState<number | null>(null);
  const [bookTitle, setBookTitle] = useState<string>("Reading...");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // =============================================================
  // 🔐 ACCESS VERIFICATION (NFT Ownership OR Library Borrowing)
  // =============================================================
  useEffect(() => {
    const verifyAccess = async () => {
      if (!authenticated || !user?.wallet?.address) {
        console.log('⚠️ [Access Check] User not authenticated or no wallet');
        setOwnsNFT(false);
        setHasBorrowed(false);
        setError("Please login to read this book");
        setLoading(false);
        return;
      }

      try {
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });

        const userAddress = user.wallet.address;
        const tokenId = BigInt(bookId);

        // Check NFT ownership
        console.log('🔍 [Access] Checking NFT ownership...');
        const balance = await publicClient.readContract({
          address: contractAddress,
          abi: contractABI,
          functionName: 'balanceOf',
          args: [userAddress, tokenId],
        });

        const owns = balance > 0n;
        console.log(`✅ [Access] NFT Balance: ${balance.toString()}, Owns: ${owns}`);
        setOwnsNFT(owns);

        // Check library borrowing
        if (!owns) {
          console.log('🔍 [Access] Checking library borrow status...');
          const activeBorrows = await publicClient.readContract({
            address: libraryPoolAddress,
            abi: libraryPoolABI,
            functionName: 'getActiveBorrows',
            args: [userAddress],
          });

          const borrowed = Array.isArray(activeBorrows) && activeBorrows.some(
            (borrow: any) => Number(borrow.tokenId) === Number(bookId)
          );

          console.log(`✅ [Access] Library Borrow: ${borrowed}`);
          setHasBorrowed(borrowed);

          if (borrowed) {
            const borrowRecord = activeBorrows.find(
              (borrow: any) => Number(borrow.tokenId) === Number(bookId)
            );
            if (borrowRecord) {
              setBorrowExpiry(Number(borrowRecord.expiry));
              console.log(`⏰ [Access] Borrow expires at: ${new Date(Number(borrowRecord.expiry) * 1000).toLocaleString()}`);
            }
          }
        }

        // If user doesn't own and hasn't borrowed, deny access
        if (!owns && !activeBorrows?.some((b: any) => Number(b.tokenId) === Number(bookId))) {
          setError("You don't have access to this book. Please purchase or borrow it first.");
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ [Access Check] Error:', err);
        setOwnsNFT(false);
        setHasBorrowed(false);
        setError("Failed to verify book access");
        setLoading(false);
      }
    };

    verifyAccess();
  }, [authenticated, user, bookId]);

  // =============================================================
  // 📚 FETCH BOOK DATA & PDF URL
  // =============================================================
  useEffect(() => {
    const fetchBook = async () => {
      if (error || (ownsNFT === false && hasBorrowed === false)) {
        console.log('⏭️ [Fetch] Skipping - access denied');
        return;
      }

      try {
        console.log('📚 [Fetch] Loading book data...');
        const { data: book, error: fetchError } = await supabase
          .from('Book')
          .select('*')
          .eq('id', bookId)
          .single();

        if (fetchError || !book) {
          console.error('❌ [Fetch] Failed to load book:', fetchError);
          setError("Failed to load book information");
          setLoading(false);
          return;
        }

        console.log('✅ [Fetch] Book data:', book);
        setBookTitle(book.title);

        // Handle PDF URL (Supabase Storage or IPFS)
        const pdfPath = book.epub; // Reusing 'epub' field for PDF path

        if (isSupabaseStorageUrl(pdfPath)) {
          console.log('🔐 [PDF] Loading from Supabase Storage...');
          // For Supabase, we need to generate signed URL
          const bookIdNum = parseInt(bookId);
          const filePath = `${bookIdNum}/book.pdf`;

          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('libere-books')
            .createSignedUrl(filePath, 300); // 5 minutes

          if (urlError || !signedUrlData?.signedUrl) {
            console.error('❌ [PDF] Failed to get signed URL:', urlError);
            setError("Failed to load PDF file");
            setLoading(false);
            return;
          }

          console.log('✅ [PDF] Signed URL generated');
          setPdfUrl(signedUrlData.signedUrl);
        } else {
          console.log('🌐 [PDF] Loading from IPFS...');
          setPdfUrl(pdfPath);
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ [Fetch] Error:', err);
        setError("Failed to load book");
        setLoading(false);
      }
    };

    if (ownsNFT !== null || hasBorrowed !== null) {
      fetchBook();
    }
  }, [bookId, ownsNFT, hasBorrowed, error]);

  // =============================================================
  // 💾 SAVE READING PROGRESS
  // =============================================================
  useEffect(() => {
    // Load saved page
    const savedPage = localStorage.getItem(`pdf-page-${bookId}`);
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }

    // Load bookmark status
    const savedBookmark = localStorage.getItem(`pdf-bookmark-${bookId}`);
    setIsBookmarked(savedBookmark === 'true');
  }, [bookId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    localStorage.setItem(`pdf-page-${bookId}`, page.toString());
  };

  const toggleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    localStorage.setItem(`pdf-bookmark-${bookId}`, newBookmarkState.toString());
  };

  // =============================================================
  // 🎨 RENDER
  // =============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error || (ownsNFT === false && hasBorrowed === false)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center max-w-md px-6">
          <div className="mb-4 text-red-600">
            <FaBookOpen className="text-5xl mx-auto mb-3" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6">{error || "You don't have permission to read this book."}</p>
          <button
            onClick={() => navigate('/books')}
            className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-zinc-700" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">{bookTitle}</h1>
            {hasBorrowed && borrowExpiry && (
              <p className="text-xs text-zinc-500">
                Borrowed • Expires: {new Date(borrowExpiry * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={toggleBookmark}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? (
            <FaBookmark className="text-amber-500 text-xl" />
          ) : (
            <FaRegBookmark className="text-zinc-700 text-xl" />
          )}
        </button>
      </div>

      {/* Watermark Overlay */}
      <WatermarkOverlay userEmail={user?.email?.address || user?.google?.email || 'Anonymous'} />

      {/* PDF Viewer */}
      {pdfUrl && (
        <PdfViewer
          pdfUrl={pdfUrl}
          onPageChange={handlePageChange}
          initialPage={currentPage}
        />
      )}
    </div>
  );
};

export default PdfReaderScreen;
