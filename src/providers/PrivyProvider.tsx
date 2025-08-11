import { PrivyProvider } from "@privy-io/react-auth";
import config from "../libs/config";

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
      }}
    >
      {children}
    </PrivyProvider>
  );
}
