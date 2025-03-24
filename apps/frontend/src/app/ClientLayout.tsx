'use client';

import { UserAccountContextProvider } from '@/app/providers/UserAccountContext';
import { WalletContextProvider } from '@/app/providers/WalletContextProvider';
import { SupabaseAuthProvider } from '@/app/providers/SupabaseAuthProvider';
import { WithChildren } from '@/types/UtilityTypes';

export function ClientLayout({ children }: WithChildren) {
  return (
    <WalletContextProvider>
      <UserAccountContextProvider>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
      </UserAccountContextProvider>
    </WalletContextProvider>
  );
}
