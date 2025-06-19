import { WithChildren } from '@/types/UtilityTypes';
import { usePrivy } from '@privy-io/react-auth';
import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { getCurrentUser, authenticateWithWallet, authenticateWithEmailAndWallet } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

interface UserAccountContextData {
  userAddress: string | undefined;
  userId: string | undefined;
  supabaseUser: User | null;
  isConnected: boolean;
  isLoading: boolean;
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
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchAttemptedRef = useRef(false);
  
  useEffect(() => {
    if (!ready || !authenticated) {
      setSupabaseUser(null);
      fetchAttemptedRef.current = false;
    }
  }, [ready, authenticated]);

  // Fetch Supabase user data with debounce to prevent excessive calls
  const fetchSupabaseUser = useCallback(async () => {
    if (!ready || !authenticated || !user?.id) {
      setSupabaseUser(null);
      setIsLoading(false);
      return;
    }
    
    // Always re-authenticate when user changes to ensure proper user switching
    // Don't re-fetch only if we already have a user for the current Privy user
    const currentWalletAddress = user?.wallet?.address || user?.linkedAccounts?.find(account => 
      account.type === 'wallet'
    )?.address;
    
    // If we have a supabaseUser but the wallet address has changed, force re-auth
    if (supabaseUser && currentWalletAddress && 
        !supabaseUser.user_metadata?.wallet_address?.includes(currentWalletAddress)) {
      // Wallet changed, need to re-authenticate
      setSupabaseUser(null);
    } else if (supabaseUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // First try to get existing user
      let supabaseUserData = await getCurrentUser();
      
      // If no existing session, authenticate with available credentials
      if (!supabaseUserData && user.id) {        
        // Get wallet address from Privy user object
        const walletAddress = user.wallet?.address || user.linkedAccounts?.find(account => 
          account.type === 'wallet'
        )?.address;
        
        // Get email from Privy user object
        const emailAddress = user.email?.address;
        
        // Try to authenticate with email and/or wallet
        if (emailAddress || walletAddress) {
          supabaseUserData = await authenticateWithEmailAndWallet(
            emailAddress || '', 
            walletAddress || '', 
            user.id
          );
        }
      }
      
      if (supabaseUserData) {
        setSupabaseUser(supabaseUserData);
      } else {
        console.warn('Failed to authenticate with Supabase');
        setSupabaseUser(null);
      }
    } catch (error) {
      console.error('Error fetching/authenticating Supabase user:', error);
      setSupabaseUser(null);
    } finally {
      setIsLoading(false);
      fetchAttemptedRef.current = true;
    }
  }, [ready, authenticated, user?.id, user?.wallet?.address, user?.email?.address, supabaseUser]);
  
  useEffect(() => {
    if (!fetchAttemptedRef.current || (ready && authenticated && !supabaseUser)) {
      fetchSupabaseUser();
    }
    
    // Set up an interval to periodically refresh the Supabase session
    // This helps maintain the session across page refreshes, but with less frequency
    const intervalId = setInterval(() => {
      if (ready && authenticated && !supabaseUser) {
        fetchSupabaseUser();
      }
    }, 10000); 
    
    return () => {
      clearInterval(intervalId);
    };
  }, [ready, authenticated, fetchSupabaseUser, supabaseUser]);

  const data: UserAccountContextData = useMemo(() => {
    return {
      userAddress: user?.wallet?.address,
      userId: user?.id,
      supabaseUser,
      isConnected: ready && authenticated,
      isLoading,
      login,
      logout,
    };
  }, [user?.wallet, user?.id, authenticated, ready, login, logout, supabaseUser, isLoading]);

  return (
    <UserAccountContext.Provider value={data}>
      {children}
    </UserAccountContext.Provider>
  );
}
