/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { contractAddress, contractABI } from "../../smart-contract.abi";
import CivilibAccessButton from "./CivilibAccessButton";

interface Props {
  book: Book;
  client: any;
  clientPublic: any;
}

const CivilibBookCard = ({ book, client, clientPublic }: Props) => {
  const [accessed, setAccessed] = useState(0);
  const [availability, setAvailability] = useState(0);

  const isBookAvailable = availability - accessed == 0 ? false : true;
  const bookLeftAmount = availability - accessed;

  useEffect(() => {
    const fetchAccessInfo = async () => {
      try {
        const data: any = await clientPublic.readContract({
          address: contractAddress,
          abi: contractABI,
          functionName: "getAccessInfo",
          args: [book.id],
        });

        setAvailability(Number(data[0]));
        setAccessed(Number(data[1]));
      } catch (error) {
        console.error("Error fetching access info:", error);
      }
    };

    fetchAccessInfo();
  }, [clientPublic, book.id]);

  return (
    <li className="w-full">
      <NavLink
        to={`/books/${book.id}`}
        className="w-full flex flex-col items-center p-4 rounded border border-zinc-200"
      >
        <div className="flex">
          <div className="w-full h-64">
            <img
              src={book.metadataUri}
              alt={book.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>
        <div className="w-full mt-2">
          <h5 className="text-xl font-semibold tracking-tight text-gray-900">
            {book.title}
          </h5>
          <p className="line-clamp-1 text-sm italic text-zinc-400">
            {book.author}
          </p>
          <div className="flex items-start justify-start mt-2.5 mb-5 w-full gap-3">
            <span
              className={
                bookLeftAmount > 0
                  ? "bg-green-200 text-green-900 text-xs font-semibold px-2.5 py-0.5 rounded-sm"
                  : "bg-red-200 text-red-900 text-xs font-semibold px-2.5 py-0.5 rounded-sm"
              }
            >
              Availability: {bookLeftAmount} left
            </span>
          </div>
          <div className="w-full flex items-center gap-2 justify-between">
            <CivilibAccessButton
              client={client}
              clientPublic={clientPublic}
              isBookAvailable={isBookAvailable}
              bookId={book.id}
              smartWalletAddress={client?.account.address}
            />
          </div>
        </div>
      </NavLink>
    </li>
  );
};

export default CivilibBookCard;
