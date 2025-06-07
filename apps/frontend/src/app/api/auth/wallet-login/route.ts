import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Add retry limitation to prevent infinite loops
const MAX_SIGN_UP_ATTEMPTS = 2;

export async function POST(request: NextRequest) {
  try {
    const { wallet, privvyUserId } = await request.json();
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Create a valid email format for authentication
    const email = createEmailFromWallet(wallet);
    const password = createPasswordFromWallet(wallet);
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    
    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If sign in succeeds, return the session
    if (signInData?.session) {
      console.log('User signed in successfully');
      return NextResponse.json({ 
        success: true,
        session: signInData.session,
        user: signInData.user
      });
    }
    
    // If user doesn't exist, sign up
    if (signInError?.status === 400 || signInError?.message?.includes('Invalid login credentials')) {
      console.log('User not found, attempting sign up');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            wallet_address: wallet,
            privvy_user_id: privvyUserId
          }
        }
      });
      
      if (signUpError) {
        console.error('Error signing up:', signUpError);
        return NextResponse.json({ 
          error: 'Error signing up', 
          details: signUpError 
        }, { status: 500 });
      }
      
      // Create user profile
      if (signUpData.user) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: signUpData.user.id,
              user_id: signUpData.user.id,
              wallet_address: wallet,
              display_name: wallet.slice(0, 6) + '...' + wallet.slice(-4)
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
        }
      }
      
      // Check if we have a session from sign up
      if (signUpData.session) {
        console.log('User signed up and authenticated successfully');
        return NextResponse.json({ 
          success: true,
          session: signUpData.session,
          user: signUpData.user
        });
      }
      
      // If we don't have a session yet (email confirmation required), try to sign in again
      console.log('Attempting immediate sign in after sign up');
      const { data: secondSignInData, error: secondSignInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (secondSignInError) {
        console.error('Error signing in after sign up:', secondSignInError);
      }
      
      if (secondSignInData?.session) {
        console.log('Successfully signed in after sign up');
        return NextResponse.json({ 
          success: true,
          session: secondSignInData.session,
          user: secondSignInData.user
        });
      }
    }
    
    console.error('Authentication failed', signInError);
    return NextResponse.json({ 
      error: 'Authentication failed', 
      details: signInError 
    }, { status: 401 });
  } catch (error) {
    console.error('Wallet login error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// Convert wallet address to a valid email format for Supabase auth
function createEmailFromWallet(wallet: string): string {
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
function createPasswordFromWallet(wallet: string): string {
  const last16Chars = wallet.slice(-16);
  return `pwd_${last16Chars}`;
}
