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
  stars: number;
}