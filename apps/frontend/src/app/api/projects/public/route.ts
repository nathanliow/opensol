import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Fetch all public projects
    const { data: publicProjects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching public projects:', error);
      return NextResponse.json({ error: 'Failed to fetch public projects' }, { status: 500 });
    }
    
    return NextResponse.json(publicProjects);
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
