/* eslint-disable @typescript-eslint/no-explicit-any */
import { encodeFunctionData } from "viem";
import { baseSepolia } from "viem/chains";
import { useEffect, useState } from "react";
import { contractAddress, contractABI } from "../../smart-contract.abi";
import { FiSlash } from "react-icons/fi";
import { FaBookReader } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  client: any;
  clientPublic: any;
  isBookAvailable: boolean;
  bookId: number;
  smartWalletAddress: string;
}

interface userBorrowingBook {
  id: number;
  date: number;
}

const CivilibAccessButton = ({
  client,
  clientPublic,
  isBookAvailable,
  bookId,
  smartWalletAddress,
}: Props) => {
  const [isBorrowingBook, setIsBorrowingBook] = useState(false);
  const [borrowingInfo, setBorrowingInfo] = useState<userBorrowingBook>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessInfo = async () => {
      try {
        const res = await clientPublic.readContract({
          address: contractAddress,
          abi: contractABI,
          functionName: "hasAccess",
          args: [smartWalletAddress, bookId],
        });

        setIsBorrowingBook(res as boolean);
      } catch (error) {
        console.error("Error fetching has access info:", error);
      }
    };

    fetchAccessInfo();
  }, [bookId, clientPublic, smartWalletAddress]);

  useEffect(() => {
    if (!isBorrowingBook) return;

    const fetchBorrowingInfo = async () => {
      try {
        const res: any = await clientPublic.readContract({
          address: contractAddress,
          abi: contractABI,
          functionName: "accessRegistry",
          args: [smartWalletAddress],
        });

        setBorrowingInfo({
          id: res[0],
          date: res[1],
        });
      } catch (error) {
        console.error("Error fetching borrowing info:", error);
      }
    };

    fetchBorrowingInfo();
  }, [clientPublic, isBorrowingBook, smartWalletAddress]);

  useEffect(() => {
    if (!borrowingInfo) return;

    console.log("borrowingInfo", borrowingInfo);
  }, [borrowingInfo]);

  const onRentAccess = async () => {
    if (!client) {
      console.error("No smart account client found");
      return;
    }

    try {
      const tx = await client.sendTransaction({
        chain: baseSepolia,
        to: contractAddress,
        data: encodeFunctionData({
          abi: contractABI,
          functionName: "rentAccess",
          args: [bookId],
        }),
      });

      console.log("tx", tx);
    } catch (error) {
      console.error("Error tx rent acess info:", error);
    }
  };

  const onOpenEpub = () => {
    navigate(`/read-book/${bookId}`)
  };

  return isBookAvailable ? (
    isBorrowingBook ? (
      <button
        onClick={onOpenEpub}
        className="cursor-pointer flex flex-row gap-2 justify-center items-center w-full bg-white border border-dark-100 text-dark-100 px-2.5 py-[.25rem] rounded-sm disabled:bg-zinc-200 disabled:cursor-not-allowed
                  disabled:border-none disabled:text-zinc-400"
      >
        <FaBookReader /> ReadBook
      </button>
    ) : (
      <button
        onClick={onRentAccess}
        className="cursor-pointer flex flex-row gap-2 justify-center items-center w-full bg-white border border-dark-100 text-dark-100 px-2.5 py-[.25rem] rounded-sm disabled:bg-zinc-200 disabled:cursor-not-allowed
                  disabled:border-none disabled:text-zinc-400"
      >
        <FaBookReader /> Borrow
      </button>
    )
  ) : (
    <button
      disabled={true}
      className="cursor-pointer flex flex-row gap-2 justify-center items-center w-full bg-white border border-dark-100 text-dark-100 px-2.5 py-[.25rem] rounded-sm disabled:bg-zinc-200 disabled:cursor-not-allowed
                disabled:border-none disabled:text-zinc-400"
    >
      <FiSlash />
      Not available
    </button>
  );
};

export default CivilibAccessButton;
