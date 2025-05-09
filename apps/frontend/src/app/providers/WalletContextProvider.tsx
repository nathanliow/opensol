import { WithChildren } from '@/types/UtilityTypes';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled <-- THIS IS INSANE WHY WOULD ANYONE SET THIS TO FALSE???
  shouldAutoConnect: true,
});

export function WalletContextProvider({ children }: WithChildren) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_ID || ''}
      config={{
        appearance: {
          theme: 'dark',
          walletChainType: 'solana-only',
          walletList: ['phantom'],
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
