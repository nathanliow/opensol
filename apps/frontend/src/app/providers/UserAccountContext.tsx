import { WithChildren } from '@/types/UtilityTypes';
import { usePrivy } from '@privy-io/react-auth';
import { createContext, useContext, useMemo } from 'react';

interface UserAccountContextData {
  userAddress: string | undefined;

  isConnected: boolean;
  login: () => void;
  logout: () => void;
}

const UserAccountContext = createContext<UserAccountContextData>(
  {} as UserAccountContextData,
);

// Hook to consume context
export const useUserAccountContext = () => useContext(UserAccountContext);

export function UserAccountContextProvider({ children }: WithChildren) {
  const { user, authenticated, ready, login, logout } = usePrivy();

  const data: UserAccountContextData = useMemo(() => {
    return {
      userAddress: user?.wallet?.address,
      isConnected: ready && authenticated,
      login,
      logout,
    };
  }, [user?.wallet, authenticated, ready, login, logout]);

  return (
    <UserAccountContext.Provider value={data}>
      {children}
    </UserAccountContext.Provider>
  );
}
