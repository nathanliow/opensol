import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fix: correctly access the project ID parameter
    const projectId = (await params).id;
    
    // First check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('stars')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Project error:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user already has a profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('starred_projects')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // If no profile exists, create one
    if (!userProfile) {
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          starred_projects: [projectId],
          monthly_earnings: [{"year":2025,"month":1,"earnings":0},{"year":2025,"month":2,"earnings":0},{"year":2025,"month":3,"earnings":0},{"year":2025,"month":4,"earnings":0},{"year":2025,"month":5,"earnings":0},{"year":2025,"month":6,"earnings":0},{"year":2025,"month":7,"earnings":0},{"year":2025,"month":8,"earnings":0},{"year":2025,"month":9,"earnings":0},{"year":2025,"month":10,"earnings":0},{"year":2025,"month":11,"earnings":0},{"year":2025,"month":12,"earnings":0}],
          display_name: user.email || user.id.substring(0, 8)
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }

      // Update star count (+1 because it's a new star)
      const newStarCount = (project.stars || 0) + 1;
      
      const { error: updateProjectError } = await supabase
        .from('projects')
        .update({ stars: newStarCount })
        .eq('id', projectId);

      if (updateProjectError) {
        console.error('Error updating project stars:', updateProjectError);
        return NextResponse.json({ 
          error: 'Failed to update project stars', 
          details: updateProjectError.message 
        }, { status: 500 });
      }

      return NextResponse.json({ stars: newStarCount, hasStarred: true });
    }

    // User profile exists, check if already starred
    const currentStarred = userProfile.starred_projects || [];
    const hasStarred = currentStarred.includes(projectId);
    
    // Update stars count
    const newStarCount = hasStarred 
      ? Math.max((project.stars || 1) - 1, 0) 
      : (project.stars || 0) + 1;
      
    const { data: updatedProject, error: updateCountError } = await supabase
      .from('projects')
      .update({ stars: newStarCount })
      .eq('id', projectId)
      .select('stars')
      .single();

    if (updateCountError) {
      console.error('Error updating star count:', updateCountError);
      return NextResponse.json({ 
        error: 'Failed to update star count', 
        details: updateCountError.message 
      }, { status: 500 });
    }

    // Update user's starred projects
    const newStarred = hasStarred
      ? currentStarred.filter((id: string) => id !== projectId) // Remove if already starred
      : [...currentStarred, projectId]; // Add if not starred
    
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({ starred_projects: newStarred })
      .eq('user_id', user.id);

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      return NextResponse.json({ 
        error: 'Failed to update user starred projects',
        details: updateProfileError.message 
      }, { status: 500 });
    }

    // Return the updated star count from the database
    return NextResponse.json({ 
      stars: updatedProject.stars, 
      hasStarred: !hasStarred 
    });
  } catch (error) {
    console.error('Error in toggle-star:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
