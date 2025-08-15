import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBookReader } from "react-icons/fa";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { contractAddress, contractABI } from "../../smart-contract.abi";

const CivilibBookCard = ({ id, title, metadataUri, author }: Book) => {
  const [accessed, setAccessed] = useState(3);
  const [availability, setAvailability] = useState(5);

  const client = createPublicClient({ chain: baseSepolia, transport: http() });

  useEffect(() => {
    const fetchAccessInfo = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data:any = await client.readContract({
          address: contractAddress,
          abi: contractABI,
          functionName: "getAccessInfo",
          args: [id],
        });

        setAvailability(Number(data[0]));
        setAccessed(Number(data[1]));
      } catch (error) {
        console.error("Error fetching access info:", error);
      }
    };

    fetchAccessInfo();
  }, [client, id]);

  return (
    <li className="w-full">
      <NavLink
        to={`/books/${id}`}
        className="w-full flex flex-col items-center p-4 rounded border border-zinc-200"
      >
        <div className="flex">
          <div className="w-full h-64">
            <img
              src={metadataUri}
              alt={title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>
        <div className="w-full mt-2">
          <h5 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h5>
          <p className="line-clamp-1 text-sm italic text-zinc-400">{author}</p>
          <div className="flex items-start justify-start mt-2.5 mb-5 w-full gap-3">
            <span className="bg-zinc-200 text-dark-100 text-xs font-semibold px-2.5 py-0.5 rounded-sm">
              Author: {author}
            </span>
          </div>
          <div className="w-full flex items-center gap-2 justify-between">
            <p className="w-[50%] flex items-end justify-start text-zinc-400 text-sm font-semibold px-2.5 py-0.5 rounded-sm">
              <span className="font-extrabold text-xl text-dark-100">
                {accessed}{" "}
              </span>{" "}
              /{availability}
            </p>
            <button className="flex flex-row gap-2 justify-center items-center w-[50%] bg-white border border-dark-100 text-dark-100 px-2.5 py-[.25rem] rounded-sm">
              <FaBookReader /> Borrow
            </button>
          </div>
        </div>
      </NavLink>
    </li>
  );
};

export default CivilibBookCard;
