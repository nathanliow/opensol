'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useRef } from 'react';
import { authenticateWithWallet, upsertUserProfile } from '@/lib/auth';
import { WithChildren } from '@/types/UtilityTypes';

// Cache successful authentications to prevent repeated requests
const authenticatedWallets = new Set();

export function SupabaseAuthProvider({ children }: WithChildren) {
  const { user, authenticated, ready } = usePrivy();
  const [authAttempts, setAuthAttempts] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const lastWalletRef = useRef<string | null>(null);
  const lastAuthTimeRef = useRef<number>(0);
  
  useEffect(() => {
    // Only proceed if Privvy is ready and user is authenticated
    if (!ready || !authenticated || !user) return;
    
    // Get current wallet address
    const walletAddress = user.wallet?.address;
    const privvyUserId = user.id;
    
    if (!walletAddress || !privvyUserId) return;
    
    // Skip if we've already authenticated this wallet in this session
    if (authenticatedWallets.has(walletAddress)) {
      console.log('Wallet already authenticated, skipping');
      return;
    }
    
    // Skip if this is the same wallet we just tried to authenticate
    if (lastWalletRef.current === walletAddress) {
      // Add time-based throttling (10 second cooldown)
      const now = Date.now();
      const timeSinceLastAuth = now - lastAuthTimeRef.current;
      
      // If less than 10 seconds since last attempt, skip
      if (timeSinceLastAuth < 10000) {
        console.log('Throttling auth attempts, waiting 10s between attempts');
        return;
      }
    }
    
    // Prevent infinite auth loops by limiting attempts
    if (authAttempts > 3) {
      console.error('Too many authentication attempts');
      return;
    }
    
    // Don't re-authenticate if already in progress
    if (isAuthenticating) return;
    
    // Update refs for throttling
    lastWalletRef.current = walletAddress;
    lastAuthTimeRef.current = Date.now();
    
    const syncAuth = async () => {
      try {
        console.log('Authenticating wallet with Supabase...');
        setIsAuthenticating(true);
        // Authenticate with Supabase using wallet address
        const supabaseUser = await authenticateWithWallet(walletAddress, privvyUserId);
        
        if (supabaseUser) {
          // Mark this wallet as authenticated to prevent future requests
          authenticatedWallets.add(walletAddress);
          
          // Create or update user profile
          await upsertUserProfile(
            supabaseUser.id,
            walletAddress,
            user.email?.address || user.wallet?.address
          );
          
          console.log('Successfully authenticated with Supabase');
        }
      } catch (error) {
        console.error('Error syncing authentication:', error);
        setAuthAttempts(prev => prev + 1);
      } finally {
        setIsAuthenticating(false);
      }
    };
    
    syncAuth();
  }, [user, authenticated, ready, authAttempts, isAuthenticating]);
  
  return <>{children}</>;
}
