import { WithChildren } from '@/types/UtilityTypes';
import { usePrivy } from '@privy-io/react-auth';
import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { getCurrentUser } from '@/lib/auth';
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
  
  // Fetch Supabase user data with debounce to prevent excessive calls
  const fetchSupabaseUser = useCallback(async () => {
    if (!ready || !authenticated) {
      setSupabaseUser(null);
      setIsLoading(false);
      return;
    }
    
    // Don't re-fetch if we already have the user
    if (supabaseUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      
      if (user) {
        // Only log on initial fetch, not on subsequent fetches
        if (!fetchAttemptedRef.current) {
          console.log('Supabase user fetched successfully:', user.id);
        }
        setSupabaseUser(user);
      } else {
        console.warn('No Supabase user found after authentication');
        setSupabaseUser(null);
      }
    } catch (error) {
      console.error('Error fetching Supabase user:', error);
      setSupabaseUser(null);
    } finally {
      setIsLoading(false);
      fetchAttemptedRef.current = true;
    }
  }, [ready, authenticated, supabaseUser]);
  
  useEffect(() => {
    // Only fetch if we haven't already or if auth state changed
    if (!fetchAttemptedRef.current || (ready && authenticated && !supabaseUser)) {
      fetchSupabaseUser();
    }
    
    // Set up an interval to periodically refresh the Supabase session
    // This helps maintain the session across page refreshes, but with less frequency
    const intervalId = setInterval(() => {
      if (ready && authenticated && !supabaseUser) {
        // Don't log retries to avoid console spam
        fetchSupabaseUser();
      }
    }, 10000); // Increased to 10s to reduce frequency
    
    return () => {
      clearInterval(intervalId);
      // Don't reset fetchAttemptedRef here to prevent refetching on every render
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
