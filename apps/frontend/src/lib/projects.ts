import { supabase } from './supabase';
import { Node, Edge } from '@xyflow/react';

// Types for project and saving operations
export interface Project {
  id?: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

// Create a new project
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return data;
}

// Get a project by ID
export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

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
