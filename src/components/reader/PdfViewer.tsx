import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  pdfUrl: string;
  onPageChange?: (page: number) => void;
  initialPage?: number;
}

const PdfViewer = ({ pdfUrl, onPageChange, initialPage = 1 }: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => {
    if (scale < 2.0) {
      setScale(scale + 0.2);
    }
  };

  const zoomOut = () => {
    if (scale > 0.6) {
      setScale(scale - 0.2);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-50">
      {/* Top Controls */}
      <div className="sticky top-0 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={previousPage}
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
            onClick={nextPage}
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
            onClick={zoomOut}
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
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="p-2 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <FaSearchPlus className="text-zinc-700" />
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center p-8 text-red-600">
                <p className="text-lg font-semibold mb-2">Failed to load PDF</p>
                <p className="text-sm">Please check your connection and try again.</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
                </div>
              }
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
