import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../core/interfaces/book.interface";
import { useCurrency } from "../contexts/CurrencyContext";
import { USDC_DECIMALS } from "../usdc-token";

interface FeaturedHeroProps {
  book: Book;
}

export const FeaturedHero = ({ book }: FeaturedHeroProps) => {
  const navigate = useNavigate();
  const { convertPrice } = useCurrency();
  const [isSaved, setIsSaved] = useState(false);

  const usdPrice = Number(book.priceEth) / Math.pow(10, USDC_DECIMALS);
  const convertedPrice = convertPrice(usdPrice);

  // Split title to highlight last word
  const titleParts = book.title.split(" ");
  const lastWord = titleParts[titleParts.length - 1];
  const firstPart = titleParts.slice(0, -1).join(" ");

  const handlePreview = () => {
    navigate(`/books/${book.id}`);
  };

  const handleAddToCollection = () => {
    navigate(`/books/${book.id}`);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save to favorites functionality
  };

  return (
    <section className="max-w-screen-xl w-full px-4 sm:px-6 py-6 sm:py-8 md:py-12 mb-8 md:mb-12">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-center">
        {/* Right Panel - Book Cover (Mobile First) */}
        <div className="w-full lg:hidden flex items-center justify-center order-1 mb-4">
          <div className="relative w-full max-w-[280px] sm:max-w-sm aspect-[3/4] group">
            {/* Decorative background blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />

            {/* Book Cover Image */}
            <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
              <img
                src={book.metadataUri}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Left Panel - Book Details */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-6 order-2 lg:order-1 w-full">
          {/* Featured Label */}
          <div className="inline-flex w-fit">
            <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-50 text-amber-700 rounded-full text-xs sm:text-sm font-medium border border-amber-200">
              Featured This Week
            </span>
          </div>

          {/* Title with Gradient Highlight */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
            <span className="text-zinc-900">{firstPart} </span>
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
              {lastWord}
            </span>
          </h1>

          {/* Author */}
          <p className="text-base sm:text-lg text-zinc-600">
            by <span className="font-semibold text-zinc-900">{book.author}</span>
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-600 leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-4">
            {book.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-4">
            {/* Preview Button */}
            <button
              onClick={handlePreview}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Preview
            </button>

            {/* Add to Collection Button */}
            <button
              onClick={handleAddToCollection}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-100 text-zinc-900 rounded-lg text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors border border-zinc-200 w-full sm:w-auto sm:flex-1"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="hidden sm:inline">Add to Collection</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all border w-full sm:w-auto ${
                isSaved
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-zinc-100 text-zinc-900 border-zinc-200 hover:bg-zinc-200"
              }`}
            >
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? "fill-current" : ""}`}
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Save
            </button>
          </div>

          {/* Price Info */}
          <div className="flex items-center mt-2 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {convertedPrice}
            </span>
          </div>
        </div>

        {/* Right Panel - Book Cover (Desktop Only) */}
        <div className="hidden lg:flex flex-1 items-center justify-center order-2">
          <div className="relative w-full max-w-md aspect-[3/4] group">
            {/* Decorative background blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />

            {/* Book Cover Image */}
            <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
              <img
                src={book.metadataUri}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
