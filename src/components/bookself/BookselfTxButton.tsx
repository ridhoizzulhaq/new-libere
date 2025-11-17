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
  const [showModal, setShowModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState("");

  const handleOpenModal = () => {
    setShowModal(true);
    setRecipientAddress("");
    setError("");
  };

  const handleCloseModal = () => {
    if (!loading) {
      setShowModal(false);
      setRecipientAddress("");
      setError("");
    }
  };

  const onTransferBook = async () => {
    if (!client) {
      setError("No smart account client found");
      return;
    }

    if (!client.account) {
      setError("No smart account client address found");
      return;
    }

    if (!recipientAddress) {
      setError("Please enter recipient address");
      return;
    }

    // Basic validation for Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const from = client.account.address;
      const to = recipientAddress;
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
        setShowModal(false);
        navigate("/bookselfs");
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Transfer failed:", error);
      setError(error instanceof Error ? error.message : "Transfer failed");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Small Badge Button */}
      <button
        onClick={handleOpenModal}
        className="flex flex-row gap-1 items-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-1 rounded text-xs font-medium transition-colors"
      >
        <BiTransfer className="text-sm" />
        <span>Transfer</span>
      </button>

      {/* Transfer Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Transfer Book
            </h3>
            <p className="text-sm text-zinc-600 mb-4">
              {book.title}
            </p>

            {/* Input Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                disabled={loading}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent disabled:bg-zinc-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onTransferBook}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Transferring..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookselfTxButton;
