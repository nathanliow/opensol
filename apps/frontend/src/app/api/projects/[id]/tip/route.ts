import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the current user using client-side Supabase instance
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('User:', user);
    // Parse request body
    const body = await request.json();
    const { amount } = body;
    const projectId = (await params).id;

    // First check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('earnings, user_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Project error:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get recipient's wallet address from user_profiles
    const { data: recipientProfile, error: recipientError } = await supabase
      .from('user_profiles')
      .select('wallet_address')
      .eq('user_id', project.user_id)
      .single();

    if (recipientError || !recipientProfile?.wallet_address) {
      console.error('Error getting recipient wallet:', recipientError);
      return NextResponse.json({ error: 'Failed to get recipient wallet address' }, { status: 500 });
    }

    const recipientWallet = recipientProfile.wallet_address;
    console.log('Recipient wallet:', recipientWallet);
    

    // Check if user already has a profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('monthly_earnings')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // If no profile exists, create one
    if (!userProfile) {
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          starred_projects: [],
          monthly_earnings: [{"year":2025,"month":1,"earnings":0},{"year":2025,"month":2,"earnings":0},{"year":2025,"month":3,"earnings":0},{"year":2025,"month":4,"earnings":0},{"year":2025,"month":5,"earnings":0},{"year":2025,"month":6,"earnings":0},{"year":2025,"month":7,"earnings":0},{"year":2025,"month":8,"earnings":0},{"year":2025,"month":9,"earnings":0},{"year":2025,"month":10,"earnings":0},{"year":2025,"month":11,"earnings":0},{"year":2025,"month":12,"earnings":0}],
          display_name: user.email || user.id.substring(0, 8)
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }
    }

    // Update the project earnings
    const newEarnings = project.earnings + amount;

    const { error: updateProjectError } = await supabase
        .from('projects')
        .update({ earnings: newEarnings })
        .eq('id', projectId);

    if (updateProjectError) {
      console.error('Error updating project earnings:', updateProjectError);
      return NextResponse.json({ 
        error: 'Failed to update project earnings', 
        details: updateProjectError.message 
      }, { status: 500 });
    }

    // TODO: use Kite to send USDC from user to recipientWallet
    // import transfer function from backend file so action is done on backend?


    return NextResponse.json({ earnings: newEarnings, hasEarned: true });
  } catch (error: any) {
    console.error('Error tipping project:', error);
    return NextResponse.json({ 
      error: 'Failed to tip project', 
      details: error.message 
    }, { status: 500 });
  }
}