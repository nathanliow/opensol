import { supabase } from './supabase';
import { Node, Edge } from '@xyflow/react';
import { Project } from '@/types/ProjectTypes';

// Create a new project
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return data as Project;
}

// Get a project by ID
export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  // Convert raw data to Project type
  if (data) {
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      nodes: data.nodes as Node[],
      edges: data.edges as Edge[],
      created_at: data.created_at,
      updated_at: data.updated_at,
      stars: data.stars || 0,
      is_public: data.is_public || false,
      earnings: data.earnings || 0
    } as Project;
  }

  if (error) {
    console.error('Error getting project:', error);
    throw error;
  }

  return data;
}

// Get all projects for a user
export async function getUserProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error getting user projects:', error);
    throw error;
  }

  return data || [];
}

// Update an existing project
export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return data;
}

// Delete a project
export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }

  return true;
}

// Save nodes and edges changes
export async function saveCanvasChanges(projectId: string, nodes: Node[], edges: Edge[]) {
  return updateProject(projectId, {
    nodes,
    edges
  });
}

// Get top 100 projects by stars
export async function getTopProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('stars', { ascending: false })
    .limit(100);

  console.log("top projects", data);

  if (error) {
    console.error('Error getting top projects:', error);
    throw error;
  }

  return data || [];
}

// Get number of all projects
export async function getNumTotalProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*', { 
      count: 'exact' 
    });

  if (error) {
    console.error('Error getting total number of projects:', error);
    throw error;
  }

  return data || [];
}

// Copy an existing project
export async function copyProject(projectId: string, userId: string) {
  // Get the original project
  const originalProject: Project | null = await getProject(projectId);
  if (!originalProject) {
    throw new Error('Project not found');
  }

  // Create a copy with modified name and description
  const projectCopy: Project = {
    name: `Copy - ${originalProject.name}`,
    description: originalProject.description,
    nodes: originalProject.nodes,
    edges: originalProject.edges,
    user_id: userId,
    is_public: false, // Set copy as private by default
    stars: 0,
    earnings: 0,
  };

  // Create new project with copied data
  const newProject = await createProject(projectCopy);
  return newProject;
}

// Get starred projects for a user
export async function getStarredProjects(userId: string): Promise<string[]> {
  // First check if user profile exists
  const { data: userProfile, error } = await supabase
    .from('user_profiles')
    .select('starred_projects')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no row exists

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting starred projects:', error);
    return [];
  }

  // If no profile exists, create one
  if (!userProfile) {
    try {
      await supabase.from('user_profiles').insert({
        user_id: userId,
        starred_projects: [],
      });
    } catch (insertError) {
      console.error('Error creating user profile:', insertError);
    }
    return [];
  }

  return userProfile?.starred_projects || [];
}

// Update starred projects for a user
export async function updateStarredProjects(userId: string, projectId: string, isStarring: boolean) {
  console.log(`Updating starred projects for user: ${userId} project: ${projectId} isStarring: ${isStarring}`);

  // First check if user profile exists
  const { data: userProfile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('starred_projects')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle instead of single

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching starred projects:', fetchError);
    return false;
  }

  let currentStarred = userProfile?.starred_projects || [];
  
  // If no profile exists, create one
  if (!userProfile) {
    try {
      const { error: insertError } = await supabase.from('user_profiles').insert({
        user_id: userId,
        starred_projects: isStarring ? [projectId] : [],
      });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return false;
      }
      
      return true;
    } catch (insertError) {
      console.error('Error creating user profile:', insertError);
      return false;
    }
  }

  // Update existing profile
  const newStarred = isStarring 
    ? [...new Set([...currentStarred, projectId])]  // Add and deduplicate
    : currentStarred.filter((id: string) => id !== projectId); // Remove

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ starred_projects: newStarred })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating starred projects:', updateError);
    return false;
  }

  return true;
}