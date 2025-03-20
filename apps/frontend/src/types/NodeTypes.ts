import { NodeTypes } from "@xyflow/react";
import GetNode from "../components/nodes/getNode";
import ObjectNode from "../components/nodes/objectNode";
import MintNode from "../components/nodes/mintNode";
import ConstNode from "../components/nodes/constNode";
import FunctionNode from "../components/nodes/FunctionNode";
import PrintNode from "../components/nodes/PrintNode";

export type NodeCategory = 'Default' | 'DeFi' | 'Misc';

export interface NodeType {
  id: string;
  label: string;
  category: NodeCategory;

  backgroundColor: string; // bg-xxxx-xxxx (tailwind)
  borderColor: string; // border-xxxx-xxxx (tailwind)
  primaryColor: string; 
  secondaryColor: string;
  textColor: string; // text-xxxx-xxxx (tailwind)
}

// nodeTypes only for Canvas
export const createNodeTypes = (setNodes: (updater: any) => void) => ({  
  // Default
  GET: GetNode,
  OBJECT: ObjectNode,
  CONST: ConstNode,
  FUNCTION: FunctionNode,
  PRINT: PrintNode,

  // DeFi
  MINT: MintNode,

  // Misc
  
} satisfies NodeTypes);

// Data for node types (NEEDS TO MATCH THE NODE TYPES IN THE CANVAS)
export const nodeTypesData: Record<string, NodeType> = {

  /* ------------------------------------------------------------ */
  /* -------------------------- DEFAULT ------------------------- */
  /* ------------------------------------------------------------ */

  GET: { 
    id: 'GET', 
    label: 'GET', 
    category: 'Default', 
    backgroundColor: 'bg-blue-200',
    borderColor: 'border-blue-400',
    primaryColor: 'blue-200', 
    secondaryColor: 'blue-400',
    textColor: 'text-black'
  },
  OBJECT: { 
    id: 'OBJECT', 
    label: 'OBJECT', 
    category: 'Default', 
    backgroundColor: 'bg-blue-300',
    borderColor: 'border-blue-500',
    primaryColor: 'blue-400', 
    secondaryColor: 'blue-600',
    textColor: 'text-black'
  },
  CONST: {
    id: 'CONST',
    label: 'CONST',
    category: 'Default',
    backgroundColor: 'bg-white',
    borderColor: 'border-black',
    primaryColor: 'white',
    secondaryColor: 'white',
    textColor: 'text-black'
  },
  FUNCTION: {
    id: 'FUNCTION',
    label: 'FUNCTION',
    category: 'Default',
    backgroundColor: 'bg-white',
    borderColor: 'border-black',
    primaryColor: 'white',
    secondaryColor: 'white',
    textColor: 'text-black'
  },
  PRINT: {
    id: 'PRINT',
    label: 'PRINT',
    category: 'Default',
    backgroundColor: 'bg-white',
    borderColor: 'border-black',
    primaryColor: 'white',
    secondaryColor: 'white',
    textColor: 'text-black'
  },

  /* ------------------------------------------------------------ */
  /* -------------------------- DEFI ---------------------------- */
  /* ------------------------------------------------------------ */

  MINT: {
    id: 'MINT',
    label: 'MINT',
    category: 'DeFi',
    backgroundColor: 'bg-red-200',
    borderColor: 'border-red-400',
    primaryColor: 'red',
    secondaryColor: 'red',
    textColor: 'text-black'
  },
};