import { NavLink } from "react-router-dom";
import { USDC_DECIMALS } from "../usdc-token";
import { useCurrency } from "../contexts/CurrencyContext";

const BookCard = ({ id, title, metadataUri, author, priceEth }: Book) => {
  const { convertPrice } = useCurrency();

  // All books now use USDC - convert from USDC units (6 decimals) to USD
  const usdPrice = Number(priceEth) / Math.pow(10, USDC_DECIMALS);

  // Convert to user's selected currency
  const convertedPrice = convertPrice(usdPrice);

  return (
    <li className="w-full">
      <NavLink
        to={`/books/${id}`}
        className="group w-full flex flex-col bg-white rounded-lg border-2 border-zinc-200 hover:border-zinc-900 transition-all duration-200 overflow-hidden"
      >
        {/* Book Cover with Price Overlay */}
        <div className="relative w-full h-72 overflow-hidden bg-zinc-100">
          <img
            src={metadataUri}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Price Tag - Show converted price with USDC */}
          <div className="absolute top-3 right-3 bg-zinc-900 text-white px-3 py-1.5 rounded-md shadow-lg">
            <div className="text-lg font-bold">
              {convertedPrice}
            </div>
            <div className="text-[10px] opacity-80">
              ${usdPrice.toFixed(2)} USDC
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 line-clamp-2 leading-snug mb-1">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-1">{author}</p>
        </div>
      </NavLink>
    </li>
  );
};

export default BookCard;
