import axios from "axios";
import { useState } from "react";
import config from "../libs/config";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { baseSepolia } from "viem/chains";
import { contractABI, contractAddress } from "../smart-contract.abi";
import { encodeFunctionData } from "viem";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import type { Book } from "../core/interfaces";
import { USDC_DECIMALS } from "../usdc-token";

const initialFormData = {
  title: "",
  description: "",
  author: "",
  publisher: "",
  image: null,
  epub: null,
  price: "",
  royaltyValue: "",
};

const pinataHeaders = {
  pinata_api_key: config.env.pinata.apiKey,
  pinata_secret_api_key: config.env.pinata.secretApiKey,
};

const baseUrl = config.env.supabase.baseUrl;

const CreateBookV2Screen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    publisher: "",
    image: null,
    epub: null,
    price: "",
    royaltyValue: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { client } = useSmartWallets();

  const handleResetForm = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setError("");
    setLoadingMessage("");
  };

  // Auth check removed - ProtectedRoute handles this

  const uploadFileToIPFS = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        { headers: { ...pinataHeaders, "Content-Type": "multipart/form-data" } }
      );

      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch {
      throw new Error("Failed to upload file to IPFS");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setFormData((prev) => ({ ...prev, [name]: file }));

        // Create preview for image files
        if (name === "image" && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!client) {
      setError("Please connect your wallet first");
      return;
    }

    if (!formData.image || !formData.epub) {
      setError("Please upload both cover image and EPUB file");
      return;
    }

    if (Number(formData.royaltyValue) < 0 || Number(formData.royaltyValue) > 10) {
      setError("Royalty value must be between 0% and 10%");
      return;
    }

    if (Number(formData.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      // Upload cover image to IPFS
      setLoadingMessage("Uploading cover image to IPFS...");
      const metadataUri = await uploadFileToIPFS(formData.image!);

      // Upload EPUB to IPFS
      setLoadingMessage("Uploading EPUB file to IPFS...");
      const epubData = await uploadFileToIPFS(formData.epub!);

      // Prepare transaction data
      const id = dayjs().unix();
      // Convert USDC price to smallest unit (6 decimals)
      // Example: 10 USDC = 10 * 10^6 = 10000000
      const priceInUSDC = Math.floor(Number(formData.price) * Math.pow(10, USDC_DECIMALS));
      const addressRecipient = client.account.address;
      const addressRoyaltyRecipient = client.account.address;
      const royaltyPercent = Number(formData.royaltyValue) * 100;

      // Send blockchain transaction
      setLoadingMessage("Creating book on blockchain...");
      const tx = await client.sendTransaction({
        chain: baseSepolia,
        to: contractAddress,
        data: encodeFunctionData({
          abi: contractABI,
          functionName: "createItem",
          args: [
            BigInt(id),
            BigInt(priceInUSDC),
            addressRecipient,
            addressRoyaltyRecipient,
            royaltyPercent,
            metadataUri,
          ],
        }),
      });

      console.log("Transaction hash:", tx);

      // Save to database
      setLoadingMessage("Saving book metadata...");
      const data: Book = {
        id: id,
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        description: formData.description,
        metadataUri: metadataUri,
        epub: epubData,
        priceEth: priceInUSDC.toString(), // Storing USDC price (with 6 decimals)
        royalty: royaltyPercent,
        addressReciepent: addressRecipient,
        addressRoyaltyRecipient: addressRoyaltyRecipient,
      };

      await axios.post(`${baseUrl}/rest/v1/Book`, data, {
        headers: {
          apiKey: config.env.supabase.apiKey,
          "Content-Type": "application/json",
        },
      });

      setLoadingMessage("Book published successfully!");

      // Reset form and navigate
      setTimeout(() => {
        handleResetForm();
        navigate("/books");
      }, 1500);

    } catch (error: any) {
      console.error("Publication failed:", error);
      setError(
        error.message || "Failed to publish book. Please try again."
      );
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-white flex flex-row">
      <section
        className="w-[50vw] bg-zinc-200 bg-cover bg-center relative flex justify-end items-center"
        style={{ backgroundImage: "url('/images/book.jpg')" }}
      >
        <div className="absolute inset-0 backdrop-blur-xs"></div>
        <div className="relative max-w-xl z-10 not-last-of-type:w-full flex justify-center flex-col">
          <div className="container mx-auto pt-12 pl-12">
            <button
              onClick={() => navigate("/books")}
              className="cursor-pointer hover:underline"
            >
              &larr; Back
            </button>

            <div className="w-full flex flex-col gap-3 mt-4">
              <h2 className="text-3xl font-extrabold">Publish your book</h2>
              <p className="w-[80%] mb-6 text-xl">
                Share your books with the world by publishing them on-chain,
                allowing readers to access, borrow, and enjoy your creations
                transparently and securely.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-[50vw] flex justify-start items-center">
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} className="p-8 w-full space-y-4">
            <h2 className="text-2xl font-semibold mb-6">Add New Item</h2>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Loading Message */}
            {loading && loadingMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">{loadingMessage}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Title</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Book Title"
                  required
                  className="block w-full h-10 px-3 mt-1 text-sm text-dark-100 border border-zinc-300 focus:outline-none rounded focus:border-zinc-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2">
              <div>
                <label className="block text-sm font-medium">Author</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Enter Author"
                    required
                    className="block w-full h-10 px-3 mt-1 text-sm text-dark-100 border border-zinc-300 focus:outline-none rounded focus:border-zinc-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Publisher</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="Enter publisher"
                    required
                    className="block w-full h-10 px-3 mt-1 text-sm text-dark-100 border border-zinc-300 focus:outline-none rounded focus:border-zinc-800"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <div className="mt-1">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter book description"
                  rows={10}
                  required
                  className="resize-none block w-full h-[6rem] px-3 py-1.5 mt-1 text-sm text-dark-100 border border-zinc-300 focus:outline-none rounded focus:border-zinc-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                required
                className="mt-2 block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-200 file:text-zinc-800 hover:file:bg-zinc-300 cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-32 h-48 object-cover rounded border border-zinc-300"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">EPUB File</label>
              <input
                type="file"
                name="epub"
                accept=".epub"
                onChange={handleChange}
                required
                className="mt-2 block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-200 file:text-zinc-800 hover:file:bg-zinc-300 cursor-pointer"
              />
              {formData.epub && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {(formData.epub as File).name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-2">
              <div>
                <label className="block text-sm font-medium">Price (USDC)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    placeholder="Enter book price in USDC"
                    required
                    className="block w-full h-10 px-3 mt-1 text-sm text-dark-100 border border-zinc-300 focus:outline-none rounded focus:border-zinc-800"
                  />
                </div>
                {formData.price && (
                  <p className="text-xs text-gray-500 mt-1">
                    = {(Number(formData.price) * Math.pow(10, USDC_DECIMALS)).toLocaleString()} USDC units
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Royalty Value % (Max 10%)
                </label>
                <input
                  type="number"
                  name="royaltyValue"
                  value={formData.royaltyValue}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  placeholder="Enter book royalty"
                  required
                  className="block w-full h-10 px-3 mt-1 text-sm text-dark-100 border border-zinc-300 focus:outline-none rounded focus:border-zinc-800"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-zinc-800 font-bold text-white py-2 px-4 rounded focus:outline-none hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (loadingMessage || "Processing...") : "Publish Book"}
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                disabled={loading}
                className="px-6 py-2 border border-zinc-300 text-zinc-700 rounded hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateBookV2Screen;
