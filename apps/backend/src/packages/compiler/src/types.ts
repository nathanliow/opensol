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

/*
 * API KEY TYPES
 */

export type ApiKeyType = 'helius' | 'openai' | 'birdeye';

export type HeliusApiKeyTiers = 'free' | 'developer' | 'business' | 'professional';
export type BirdeyeApiKeyTiers = 'standard' | 'starter' | 'premium' | 'business' | 'enterprise';

export type ApiKey = {
  key: string;
  tier: HeliusApiKeyTiers | BirdeyeApiKeyTiers | null;
}

/*
 * BLOCK FUNCTION TEMPLATE TYPES
 */

export interface BlockFunctionTemplateParameters {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]' | 'dropdown';
  defaultValue?: any;
  options?: string[]; // Available options when type is 'dropdown'
}

export interface BlockFunctionTemplateMetadata {
  name: string;
  description: string;
  blockType: string;
  blockCategory?: string;
  parameters: BlockFunctionTemplateParameters[];
  requiredKeys?: ApiKeyType[];
  requiredKeyTiers?: {
    [key in ApiKeyType]?: HeliusApiKeyTiers | BirdeyeApiKeyTiers | Array<HeliusApiKeyTiers | BirdeyeApiKeyTiers>;
  };
  output?: {
    type: string;
    description: string;
  };
}

export interface BlockFunctionTemplate {
  metadata: BlockFunctionTemplateMetadata;
  execute: (params: Record<string, any>) => Promise<any>;
}