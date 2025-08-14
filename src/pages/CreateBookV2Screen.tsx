import axios from "axios";
import { useEffect, useState } from "react";
import config from "../libs/config";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { baseSepolia } from "viem/chains";
import { contractABI, contractAddress } from "../smart-contract.abi";
import { encodeFunctionData } from "viem";
import dayjs from "dayjs";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import type { Book } from "../core/interfaces";

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
  const [ethPrice, setEthPrice] = useState(0);
  const [ethAmount, setEthAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { client } = useSmartWallets();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        setEthPrice(data.ethereum.usd);
      } catch (err) {
        console.error("Failed to get ETH Price", err);
      }
    };

    fetchPrice();
  }, []);

  const handleResetForm = () => {
    setFormData(initialFormData);
  };

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
        setFormData((prev) => ({ ...prev, [name]: target.files![0] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "price" && ethPrice > 0) {
        const ethValue = parseFloat(value) / ethPrice;
        setEthAmount(isNaN(ethValue) ? "" : ethValue.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    if (!client) {
      console.error("No smart account client found");
      setLoading(false);
      return;
    }

    if (!formData.image && !formData.epub) {
      console.error("No image cover and epub file");
      setLoading(false);
      return;
    }

    try {
      const id = dayjs().unix();
      const price = ethers.parseEther(Number(ethAmount).toFixed(18));
      const addressRecipient = client.account.address;
      const addressRoyaltyRecipient = client.account.address;
      const royaltyPercent = Number(formData.royaltyValue) * 100;
      const metadataUri = await uploadFileToIPFS(formData.image!);
      const epubData = await uploadFileToIPFS(formData.epub!);

      const tx = await client.sendTransaction({
        chain: baseSepolia,
        to: contractAddress,
        data: encodeFunctionData({
          abi: contractABI,
          functionName: "createItem",
          args: [
            id,
            price,
            addressRecipient,
            addressRoyaltyRecipient,
            royaltyPercent,
            metadataUri,
          ],
        }),
      });

      console.log("tx", tx);

      const data: Book = {
        id: id,
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        description: formData.description,
        metadataUri: metadataUri,
        epub: epubData,
        priceEth: price.toString(),
        royalty: royaltyPercent,
        addressReciepent: addressRecipient,
        addressRoyaltyRecipient: addressRoyaltyRecipient,
      };

      const uploadToDB = await axios.post(`${baseUrl}/rest/v1/Book`, data, {
        headers: {
          apiKey: config.env.supabase.apiKey,
          "Content-Type": "application/json",
        },
      });

      console.warn("updateToDB", uploadToDB);
      setLoading(false);

      handleResetForm();
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-white flex flex-row">
      <section className="w-[50vw] bg-zinc-200"></section>
      <section className="w-[50vw] flex justify-start items-center">
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} className="p-8 w-full space-y-4">
            <h2 className="text-2xl font-semibold mb-6">Add New Item</h2>
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
            </div>

            <div className="grid grid-cols-2 gap-x-2">
              <div>
                <label className="block text-sm font-medium">
                  Price ($USD)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="Enter book price in USD"
                    required
                    className="block w-full h-10 px-3 mt-1 text-sm text-dark-100 border border-zinc-300 focus:outline-none rounded focus:border-zinc-800"
                  />
                </div>
                {ethPrice > 0 && formData.price && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {ethAmount} ETH (Current ETH price: ${ethPrice.toFixed(2)}
                    )
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
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-zinc-800 font-bold text-white py-2 px-4 rounded focus:outline-none disabled:bg-zinc-400 disabled:cursor-progress"
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateBookV2Screen;
