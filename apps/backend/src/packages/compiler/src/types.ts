import { Inputs } from "@/types/InputTypes";
import { Output } from "@/types/OutputTypes";

/*
 * BACKEND TYPES FOR NODES AND EDGES
 */

export interface FlowNode {
  id: string; // {node type}-{unix timestamp at creation}
  type: string; // node type ("FUNCTION", "GET", "HELIUS", etc.)
  measured?: { 
    width: number;
    height: number 
  };
  position: {
    x: number;
    y: number;
  };
  data: {
    inputs?: Inputs;
    output?: Output;
  };
  selected?: boolean;
  dragging?: boolean;
}

export interface FlowEdge {
  id: string;

  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;

  type?: string; // 'smoothstep'
  animated?: boolean; // whether the edge is animated
  style?: {
    stroke: string; // stroke color
    strokeWidth: number; // stroke width
  };
}