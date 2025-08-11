import {PrivyProvider} from '@privy-io/react-auth';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId="cme6d96ra000tjv0b6f1j1l2d"
      clientId="client-WY6PeMCbVqVbExc1z8WNP2HLomoNnEjB96HHnd8oLYaJp"
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}