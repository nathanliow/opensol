'use client';

import { UserAccountContextProvider } from '@/app/providers/UserAccountContext';
import { WalletContextProvider } from '@/app/providers/WalletContextProvider';
import { WithChildren } from '@/types/UtilityTypes';

export function ClientLayout({ children }: WithChildren) {
  return (
    <WalletContextProvider>
      <UserAccountContextProvider>
        {children}
      </UserAccountContextProvider>
    </WalletContextProvider>
  );
}
