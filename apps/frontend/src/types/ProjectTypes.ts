import { FlowNode, FlowEdge } from '../../../backend/src/packages/compiler/src/types';

// Types for project and saving operations
export interface Project {
  id?: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
  stars: number;
  is_public?: boolean;
  earnings: number;
}