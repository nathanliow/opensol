import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Add retry limitation to prevent infinite loops
const MAX_SIGN_UP_ATTEMPTS = 2;

export async function POST(request: NextRequest) {
  try {
    const { wallet, email: userEmail, privvyUserId } = await request.json();
    
    console.log('API Route received:', { wallet, userEmail, privvyUserId });
    
    if (!wallet && !userEmail) {
      return NextResponse.json({ error: 'Either wallet address or email is required' }, { status: 400 });
    }

    // Create authentication credentials based on available data
    let email: string;
    let password: string;
    
    if (userEmail) {
      // Use email-based authentication
      email = createEmailFromUserEmail(userEmail);
      password = createPasswordFromEmail(userEmail);
    } else if (wallet) {
      // Use wallet-based authentication
      email = createEmailFromWallet(wallet);
      password = createPasswordFromWallet(wallet);
    } else {
      return NextResponse.json({ error: 'Authentication data is required' }, { status: 400 });
    }
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
    
    // If sign in succeeds, update profile if needed and return the session
    if (signInData?.session) {
      console.log('User signed in successfully');
      
      // Update profile with any missing data
      if (signInData.user && (userEmail || wallet)) {
        try {
          const profileData: any = {};
          
          if (wallet) {
            profileData.wallet_address = wallet;
          }
          
          if (userEmail) {
            profileData.email = userEmail;
          }
          
          if (Object.keys(profileData).length > 0) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update(profileData)
              .eq('user_id', signInData.user.id);
              
            if (updateError) {
              console.error('Error updating profile:', updateError);
            }
          }
        } catch (error) {
          console.error('Error updating user profile:', error);
        }
      }
      
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
          const profileData: any = {
            id: signUpData.user.id,
            user_id: signUpData.user.id,
          };
          
          if (wallet) {
            profileData.wallet_address = wallet;
            profileData.display_name = wallet.slice(0, 6) + '...' + wallet.slice(-4);
          }
          
          if (userEmail) {
            profileData.email = userEmail;
            if (!profileData.display_name) {
              profileData.display_name = userEmail.split('@')[0];
            }
          }
          
          // Ensure display_name is never null
          if (!profileData.display_name) {
            profileData.display_name = `User${signUpData.user.id.slice(-8)}`;
          }
          
          console.log('Creating profile with data:', profileData);
          
          const { data: profileResult, error: profileError } = await supabase
            .from('user_profiles')
            .upsert(profileData)
            .select();

          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            console.log('Profile created successfully:', profileResult);
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

// Convert user email to a valid email format for Supabase auth
function createEmailFromUserEmail(userEmail: string): string {
  // For email authentication, we can use the email directly or create a hash
  // to ensure consistency across different email formats
  const normalizedEmail = userEmail.toLowerCase().trim();
  return normalizedEmail;
}

// Create a consistent password from email
function createPasswordFromEmail(userEmail: string): string {
  // Create a hash from the email for consistent password
  const hashInput = userEmail.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hashStr = Math.abs(hash).toString(16);
  return `email_pwd_${hashStr}`;
}
