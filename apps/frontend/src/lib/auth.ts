import { supabase } from './supabase';

// Convert wallet address to a valid email format for Supabase auth
export function createEmailFromWallet(wallet: string): string {
  // Create a simple hash from the wallet address
  const hashInput = wallet.toLowerCase();
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Use absolute value and convert to string
  const hashStr = Math.abs(hash).toString(16);
  return `wallet_${hashStr}@opensol.io`;
}

// Create a consistent password from wallet address
export function createPasswordFromWallet(wallet: string): string {
  const last16Chars = wallet.slice(-16);
  return `pwd_${last16Chars}`;
}

// Authenticate with Supabase using Privvy wallet via server-side API
export async function authenticateWithWallet(wallet: string, privvyUserId: string) {
  if (!wallet) return null;
  
  try {
    // Use the server-side API route to handle authentication
    const response = await fetch('/api/auth/wallet-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet,
        privvyUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Authentication error:', data.error);
      return null;
    }

    // Refresh the client side session with the session from the server
    if (data.session) {
      await supabase.auth.setSession(data.session);
      const { data: userData } = await supabase.auth.getUser();
      return userData?.user;
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Authenticate with Supabase using Privy email/embedded wallet
export async function authenticateWithEmailAndWallet(email: string, wallet: string, privvyUserId: string) {
  if (!email && !wallet) return null;
  
  try {
    const response = await fetch('/api/auth/wallet-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet: wallet || null,
        email: email || null,
        privvyUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Authentication error:', data.error);
      return null;
    }

    if (data.session) {
      await supabase.auth.setSession(data.session);
      const { data: userData } = await supabase.auth.getUser();
      return userData?.user;
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Get the current authenticated user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

// Sign out the current user
export async function signOut() {
  return await supabase.auth.signOut();
}

// Create or update a user profile
export async function upsertUserProfile(userId: string, walletAddress: string, displayName?: string) {
  // First check if user profile already exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('user_id', userId)
    .single();
  
  // If profile exists and has a display name, don't overwrite it
  const shouldUseExistingDisplayName = existingProfile?.display_name && existingProfile.display_name !== walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      user_id: userId,
      wallet_address: walletAddress,
      display_name: shouldUseExistingDisplayName 
        ? existingProfile.display_name 
        : (displayName || walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4))
    }, {
      onConflict: 'user_id'
    })
    .select();
  
  if (error) {
    console.error('Error upserting user profile:', error);
    return null;
  }
  
  return data[0];
}
