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

    // Parse request body
    const body = await request.json();
    const { amount, recipientUserId } = body;
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

    // Get recipient's earnings
    const { data: recipientData, error: recipientDataError } = await supabase
      .from('user_profiles')
      .select('monthly_earnings')
      .eq('user_id', recipientUserId)
      .maybeSingle();

    if (!recipientData) {
      console.error('Recipient profile not found');
      return NextResponse.json({ error: 'Recipient profile not found' }, { status: 404 });
    }

    // Update recipient's earnings
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-11, so add 1 to get 1-12
    
    // Find if there's already an entry for the current year and month
    const updatedEarnings = [...recipientData.monthly_earnings];
    const existingEntryIndex = updatedEarnings.findIndex(
      entry => entry.year === currentYear && entry.month === currentMonth
    );
    
    if (existingEntryIndex !== -1) {
      // Update existing entry
      updatedEarnings[existingEntryIndex].earnings += amount;
    } else {
      // Add new entry for current year and month
      updatedEarnings.push({ year: currentYear, month: currentMonth, earnings: amount });
    }
    
    const { error: updateRecipientEarningsError } = await supabase
      .from('user_profiles')
      .update({ monthly_earnings: updatedEarnings })
      .eq('user_id', recipientUserId);

    if (updateRecipientEarningsError) {
      console.error('Error updating recipient earnings:', updateRecipientEarningsError);
      return NextResponse.json({ error: 'Failed to update recipient earnings' }, { status: 500 });
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error tipping project:', error);
    return NextResponse.json({ 
      error: 'Failed to tip project', 
      details: error.message 
    }, { status: 500 });
  }
}