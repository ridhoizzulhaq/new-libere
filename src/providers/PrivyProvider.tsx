import { PrivyProvider } from "@privy-io/react-auth";
import config from "../libs/config";
import { baseSepolia } from "viem/chains";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={config.env.privy.appId}
      clientId={config.env.privy.clientId}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
      }}
    >
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}
