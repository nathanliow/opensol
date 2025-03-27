import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the request body
    const { isPublic } = await request.json();
    
    // Get the cookies for authentication
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the project ID from the URL
    const projectId = (await params).id;
    console.log('Toggle public for project:', projectId, 'by user:', user.id, 'to:', isPublic);
    
    // Verify the project exists and the user is the owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Project error:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Ensure the user is the project owner
    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the project owner can change visibility' }, { status: 403 });
    }

    // Update the project visibility
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ is_public: isPublic })
      .eq('id', projectId)
      .select('is_public')
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update project visibility',
        details: updateError.message 
      }, { status: 500 });
    }

    // Return the updated visibility status
    return NextResponse.json({ 
      is_public: updatedProject.is_public
    });
  } catch (error) {
    console.error('Error in toggle-public:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
