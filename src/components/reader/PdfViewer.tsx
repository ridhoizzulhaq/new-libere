import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

// Configure PDF.js worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

console.log('📦 [PdfViewer] PDF.js version:', pdfjsLib.version);

interface Props {
  pdfUrl: string;
  onPageChange?: (page: number) => void;
  onPdfLoad?: (numPages: number) => void;
  initialPage?: number;
}

const PdfViewer = ({ pdfUrl, onPageChange, onPdfLoad, initialPage = 1 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [rendering, setRendering] = useState<boolean>(false);

  // Load PDF document using native PDF.js
  useEffect(() => {
    const loadPdf = async () => {
      try {
        console.log('📥 [PdfViewer] Loading PDF from URL:', pdfUrl);

        // Fetch PDF as ArrayBuffer
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const pdfArrayBuffer = await response.arrayBuffer();
        console.log('   PDF size:', (pdfArrayBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');

        // Clone ArrayBuffer to prevent detached error
        const clonedBuffer = pdfArrayBuffer.slice(0);

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: clonedBuffer });
        const pdf = await loadingTask.promise;

        console.log(`✅ [PdfViewer] PDF loaded successfully! Total pages: ${pdf.numPages}`);

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);

        // Notify parent component
        if (onPdfLoad) {
          onPdfLoad(pdf.numPages);
        }
      } catch (err: any) {
        console.error('❌ [PdfViewer] PDF load error:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl, onPdfLoad]);

  // Set initial page
  useEffect(() => {
    if (initialPage && initialPage !== pageNumber) {
      setPageNumber(initialPage);
    }
  }, [initialPage]);

  // Auto-fit PDF to screen width
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const calculateFitToWidthScale = async () => {
      try {
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        // Get container width
        const container = canvasRef.current?.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth - 32; // Minus padding
        const pdfWidth = viewport.width;

        // Calculate scale to fit width
        const fitScale = containerWidth / pdfWidth;

        // Clamp between 0.6x and 2.0x for readability
        const initialScale = Math.max(0.6, Math.min(fitScale, 2.0));

        console.log('📐 [PdfViewer] Auto-fit calculation:');
        console.log('   Container width:', containerWidth);
        console.log('   PDF width:', pdfWidth);
        console.log('   Calculated scale:', fitScale.toFixed(2));
        console.log('   Clamped scale:', initialScale.toFixed(2));

        setScale(initialScale);
      } catch (err) {
        console.error('❌ [PdfViewer] Auto-fit calculation error:', err);
        setScale(1.0);
      }
    };

    calculateFitToWidthScale();
  }, [pdfDoc]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current || rendering) return;

      try {
        setRendering(true);
        console.log(`📄 [PdfViewer] Rendering page ${pageNumber}...`);

        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Cannot get canvas context');
        }

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        console.log(`✅ [PdfViewer] Page ${pageNumber} rendered (scale: ${scale.toFixed(1)}x)`);
        setRendering(false);
      } catch (err: any) {
        console.error(`❌ [PdfViewer] Page render error:`, err);
        setRendering(false);
      }
    };

    renderPage();
  }, [pdfDoc, pageNumber, scale, rendering]);

  // Navigation functions
  const goToPreviousPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      console.log(`📄 [PdfViewer] Navigating to page ${newPage}`);
      setPageNumber(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  }, [pageNumber, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      console.log(`📄 [PdfViewer] Navigating to page ${newPage}`);
      setPageNumber(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  }, [pageNumber, numPages, onPageChange]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPreviousPage, goToNextPage]);

  // Touch swipe navigation
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          console.log('👈 [PdfViewer] Swipe left - next page');
          goToNextPage();
        } else {
          console.log('👉 [PdfViewer] Swipe right - previous page');
          goToPreviousPage();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToPreviousPage, goToNextPage]);

  const handleZoomIn = () => {
    setScale((prev) => {
      const newScale = Math.min(prev + 0.2, 2.0);
      console.log(`🔍 [PdfViewer] Zoom in: ${newScale.toFixed(1)}x`);
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.2, 0.6);
      console.log(`🔍 [PdfViewer] Zoom out: ${newScale.toFixed(1)}x`);
      return newScale;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-50">
      {/* Top Controls */}
      <div className="sticky top-0 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1 || loading}
            className="p-2 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <FaChevronLeft className="text-zinc-700" />
          </button>

          <span className="text-sm font-medium text-zinc-900 min-w-[100px] text-center">
            {loading ? 'Loading...' : `Page ${pageNumber} of ${numPages}`}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages || loading}
            className="p-2 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <FaChevronRight className="text-zinc-700" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.6}
            className="p-2 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
          >
            <FaSearchMinus className="text-zinc-700" />
          </button>

          <span className="text-sm font-medium text-zinc-900 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 2.0}
            className="p-2 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <FaSearchPlus className="text-zinc-700" />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto p-4">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
              <p className="text-zinc-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-8 text-red-600">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold mb-2">Failed to Load PDF</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="shadow-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
