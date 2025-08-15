/* eslint-disable @typescript-eslint/no-explicit-any */
import { BiDonateHeart } from "react-icons/bi";
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
  const onTransferBook = async () => {
    if (!client) {
      console.error("No smart account client found");
      return;
    }

    if (!client.account) {
      console.error("No smart account client address found");
      return;
    }

    const userAddress = window.prompt("Enter receive user address:", "");
    if (!userAddress) {
      console.warn("Closed");
      return;
    }

    try {
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
      

      console.log("tx", tx);

      navigate("/bookselfs");
      window.location.reload();
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };
  return (
    <button
      onClick={onTransferBook}
      className="cursor-pointer flex flex-row gap-2 justify-center items-center w-full bg-green-600 hover:bg-green-700 text-white px-2.5 py-[.25rem] rounded-sm"
    >
      <BiDonateHeart />
      Transfer Book
    </button>
  );
};

export default BookselfTxButton;
