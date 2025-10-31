/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { BiTransfer } from "react-icons/bi";
import { baseSepolia } from "viem/chains";
import { encodeFunctionData } from "viem";
import { contractABI, contractAddress } from "../../smart-contract.abi";
import { useNavigate } from "react-router-dom";

interface Props {
  client: any;
  book: Book;
}

const BookselfTxButton = ({ client, book }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onTransferBook = async () => {
    if (!client) {
      console.error("No smart account client found");
      return;
    }

    if (!client.account) {
      console.error("No smart account client address found");
      return;
    }

    const userAddress = window.prompt("Enter recipient address:", "");
    if (!userAddress) {
      console.warn("Transfer cancelled");
      return;
    }

    try {
      setLoading(true);
      const from = client.account.address;
      const to = userAddress;
      const id = book.id;
      const value = 1;
      const dataType = "0x";

      const tx = await client.sendTransaction({
        chain: baseSepolia,
        to: contractAddress,
        data: encodeFunctionData({
          abi: contractABI,
          functionName: "safeTransferFrom",
          args: [from, to, id, value, dataType],
        }),
      });

      console.log("Transfer tx:", tx);

      setTimeout(() => {
        navigate("/bookselfs");
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Transfer failed:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onTransferBook}
      disabled={loading}
      className="cursor-pointer flex flex-row gap-1.5 justify-center items-center w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <BiTransfer className="text-sm" />
      {loading ? "Transferring..." : "Transfer"}
    </button>
  );
};

export default BookselfTxButton;
