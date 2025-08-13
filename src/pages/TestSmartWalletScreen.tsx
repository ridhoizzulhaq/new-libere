import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useEffect } from "react";
import { encodeFunctionData, erc20Abi } from "viem";
import { baseSepolia } from "viem/chains";

const TestSmartWalletScreen = () => {
  // const { createWallet } = useCreateWallet({
  //   onSuccess: ({ wallet }) => {
  //     console.log("Created wallet ", wallet);
  //   },
  //   onError: (error) => {
  //     console.error("Failed to create wallet with error ", error);
  //   },
  // });

  const { user } = usePrivy();
  const { client } = useSmartWallets();

  useEffect(() => {
    if (!user) return;
    console.log(user);
  }, [user]);

  const sendSmartTx = async () => {
    if (!client) return;

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: ["0x57Ae4a61a80400f0d9F8E5F3a218dAeb8b6c378F", BigInt(1000000)],
    });
    client
      .sendTransaction({
        chain: baseSepolia,
        to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        data,
      })
      .then((txHash) => {
        console.log(txHash);
      });
  };

  return (
    <div>
      <button
        className="m-10 py-2 px-4 bg-white border text-black rounded"
        onClick={() => sendSmartTx()}
      >
        Send Smart Ts
      </button>
    </div>
  );
};

export default TestSmartWalletScreen;
