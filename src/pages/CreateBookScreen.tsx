import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { contractABI, contractAddress } from "../smart-contract.abi";
import axios from "axios";
import config from "../libs/config";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { baseSepolia } from "viem/chains";
import { createPublicClient, encodeFunctionData, http } from "viem";

const CreateBookScreen = () => {
  const myWalletAddress = "0x96D7Eb053e57b81cff04F620613838Fd2224eb9c";
  const { wallets } = useWallets();
  const { client } = useSmartWallets();
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    epub: null,
    price: "",
    royaltyValue: "",
  });

  const clientRead = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  useEffect(() => {
    const setup = async () => {
      try {
        console.log("wallet", wallets);
        const wallet = wallets.find(
          (wallet) => wallet.address === myWalletAddress
        );

        if (!wallet) {
          console.warn("Wallet not found");
          return;
        }

        const provider = await wallet.getEthereumProvider();
        if (!provider) {
          console.warn("Provider not found");
          return;
        }

        const ethersProvider = new ethers.BrowserProvider(provider);
        const signerInstance = await ethersProvider.getSigner();
        const accountAddress = await signerInstance.getAddress();

        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signerInstance
        );

        setSigner(signerInstance);
        setAccount(accountAddress);
        setContract(contractInstance);

        console.log("Contract setup completed");
      } catch (error) {
        console.error("Error setting up contract:", error);
      }
    };

    if (wallets.length > 0) {
      setup();
    } else {
      console.log("no wallet");
    }
  }, [wallets]);

  const uploadToIPFS = async () => {
    try {
      const imageData = new FormData();
      imageData.append("file", formData.image!);

      const imageResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        imageData,
        {
          headers: {
            pinata_api_key: config.env.pinata.apiKey,
            pinata_secret_api_key: config.env.pinata.secretApiKey,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageHash = imageResponse.data.IpfsHash;

      const metadata = {
        name: formData.title,
        description: formData.description,
        image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
      };

      const metadataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: config.env.pinata.apiKey,
            pinata_secret_api_key: config.env.pinata.secretApiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`;
    } catch {
      throw new Error("Failed to upload metadata to IPFS");
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
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!client) {
      console.error("No smart account client found");
      return;
    }

    try {
      // const tx = await client.sendTransaction({
      //   chain: baseSepolia,
      //   to: contractAddress,
      //   data: encodeFunctionData({
      //     abi: contractABI,
      //     functionName: "createItem",
      //     args: [
      //       BigInt(111),
      //       BigInt(10000),
      //       "0x20c5FA751F10c16683cb7236a6a4d67c2Ad1782e",
      //       "0x20c5FA751F10c16683cb7236a6a4d67c2Ad1782e",
      //       BigInt(0),
      //       "ridho jelek",
      //     ],
      //   }),
      // });
      // console.log("tx", tx);

      // getAccessInfo(uint256 id) -> (availableNFTs, accessedNFTs)
      const testRead = await clientRead.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "uri",
        args: [111],
      });

      console.log("testRead", testRead);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Add New Item</h2>

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter title"
            required
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            rows={3}
            required
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
            className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            placeholder="Enter price"
            required
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Royalty Value</label>
          <input
            type="number"
            name="royaltyValue"
            value={formData.royaltyValue}
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="Enter royaltyValue"
            required
            className="mt-1 block w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none"
        >
          {loading ? "loading..." : "submit"}
        </button>
      </form>
    </div>
  );
};

export default CreateBookScreen;
