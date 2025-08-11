import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useEffect } from "react";

const CreateBookScreen = () => {
  const myWalletAddress = "0x96D7Eb053e57b81cff04F620613838Fd2224eb9c";
  const { wallets } = useWallets();

  useEffect(() => {
    const setup = async () => {
      const wallet = wallets.find((wallet) => wallet.address === myWalletAddress);

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
      const signer = await ethersProvider.getSigner();

      console.warn("signer", signer);
    };

    setup();
  }, [wallets]);

  return <div>CreateBookScreen</div>;
};

export default CreateBookScreen;
