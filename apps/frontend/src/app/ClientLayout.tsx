'use client';

import { UserAccountContextProvider } from '@/app/providers/UserAccountContext';
import { WalletContextProvider } from '@/app/providers/WalletContextProvider';
import { SupabaseAuthProvider } from '@/app/providers/SupabaseAuthProvider';
import { LessonProvider } from '@/contexts/LessonContext';
import { WithChildren } from '@/types/UtilityTypes';

export function ClientLayout({ children }: WithChildren) {
  return (
    <WalletContextProvider>
      <UserAccountContextProvider>
        <SupabaseAuthProvider>
          <LessonProvider>
            {children}
          </LessonProvider>
        </SupabaseAuthProvider>
      </UserAccountContextProvider>
    </WalletContextProvider>
  );
}
