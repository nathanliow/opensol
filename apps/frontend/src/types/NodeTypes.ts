import { NodeTypes } from "@xyflow/react";
import GetNode from "../components/nodes/blockchain/GetNode";
import ObjectNode from "../components/nodes/code/ObjectNode";
import MintNode from "../components/nodes/blockchain/MintNode";
import ConstNode from "../components/nodes/code/ConstNode";
import FunctionNode from "../components/nodes/code/FunctionNode";
import PrintNode from "../components/nodes/code/PrintNode";
import HeliusNode from "../components/nodes/provider/HeliusNode";
import MathNode from "../components/nodes/code/MathNode";
import ConditionalNode from "../components/nodes/code/ConditionalNode";
import ExampleNode from "../components/nodes/example/ExampleNode";

export type NodeCategory = 'Code' | 'Database' | 'Blockchain' | 'DeFi' | 'Provider' | 'Misc' | 'Example';

export interface NodeTypeMetadata {
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
  // Code
  OBJECT: ObjectNode,
  CONST: ConstNode,
  FUNCTION: FunctionNode,
  PRINT: PrintNode,
  MATH: MathNode,
  CONDITIONAL: ConditionalNode,

  // Database

  // Blockchain
  GET: GetNode,
  MINT: MintNode,

  // DeFi


  // Provider
  HELIUS: HeliusNode,

  // Misc

  // Example
  EXAMPLE: ExampleNode,
} satisfies NodeTypes);

export const nodeTypesMetadata: Record<string, NodeTypeMetadata> = {

  /* ------------------------------------------------------------ */
  /* -------------------------- Code ---------------------------- */
  /* ------------------------------------------------------------ */

  CONST: {
    id: 'CONST',
    label: 'CONST',
    category: 'Code',
    backgroundColor: 'bg-blue-500',
    borderColor: 'border-blue-700',
    primaryColor: 'blue-500',
    secondaryColor: 'blue-700',
    textColor: 'text-black'
  },
  OBJECT: { 
    id: 'OBJECT', 
    label: 'OBJECT', 
    category: 'Code', 
    backgroundColor: 'bg-blue-400',
    borderColor: 'border-blue-600',
    primaryColor: 'blue-400', 
    secondaryColor: 'blue-600',
    textColor: 'text-black'
  },
  CONDITIONAL: {
    id: 'CONDITIONAL',
    label: 'CONDITIONAL',
    category: 'Code',
    backgroundColor: 'bg-blue-300',
    borderColor: 'border-blue-500',
    primaryColor: 'blue-200',
    secondaryColor: 'blue-400',
    textColor: 'text-black'
  },
  MATH: {
    id: 'MATH',
    label: 'MATH',
    category: 'Code',
    backgroundColor: 'bg-blue-200',
    borderColor: 'border-blue-400',
    primaryColor: 'blue-200',
    secondaryColor: 'blue-400',
    textColor: 'text-black'
  },
  FUNCTION: {
    id: 'FUNCTION',
    label: 'FUNCTION',
    category: 'Code',
    backgroundColor: 'bg-gray-200',
    borderColor: 'border-gray-400',
    primaryColor: 'gray-200',
    secondaryColor: 'gray-400',
    textColor: 'text-black'
  },
  PRINT: {
    id: 'PRINT',
    label: 'PRINT',
    category: 'Code',
    backgroundColor: 'bg-yellow-200',
    borderColor: 'border-yellow-400',
    primaryColor: 'yellow-200',
    secondaryColor: 'yellow-400',
    textColor: 'text-black'
  },
  
  /* -------------------------------------------------------------- */
  /* -------------------------- Database -------------------------- */
  /* -------------------------------------------------------------- */

  /* -------------------------------------------------------------- */
  /* -------------------------- Blockchain ------------------------ */
  /* -------------------------------------------------------------- */

  GET: { 
    id: 'GET', 
    label: 'GET', 
    category: 'Blockchain', 
    backgroundColor: 'bg-purple-200',
    borderColor: 'border-purple-400',
    primaryColor: 'purple-200', 
    secondaryColor: 'purple-400',
    textColor: 'text-black'
  },
  MINT: {
    id: 'MINT',
    label: 'MINT',
    category: 'Blockchain',
    backgroundColor: 'bg-red-200',
    borderColor: 'border-red-400',
    primaryColor: 'red',
    secondaryColor: 'red',
    textColor: 'text-black'
  },

  /* -------------------------------------------------------------- */
  /* -------------------------- DeFi ------------------------------ */
  /* -------------------------------------------------------------- */

  /* -------------------------------------------------------------- */
  /* -------------------------- Provider -------------------------- */
  /* -------------------------------------------------------------- */
  HELIUS: {
    id: 'HELIUS',
    label: 'HELIUS',
    category: 'Provider',
    backgroundColor: 'bg-[#E84125]',
    borderColor: 'border-[#E84125]',
    primaryColor: '[#E84125]',
    secondaryColor: '[#E84125]',
    textColor: 'text-black'
  },

  /* -------------------------------------------------------------- */
  /* ---------------------------- Misc ---------------------------- */
  /* -------------------------------------------------------------- */

  // Example
  EXAMPLE: {
    id: 'EXAMPLE',
    label: 'Example',
    category: 'Example',
    backgroundColor: 'bg-green-100',
    borderColor: 'border-green-300',
    primaryColor: 'green-100',
    secondaryColor: 'green-300',
    textColor: 'text-green-800'
  },
};