import { NodeTypes } from "@xyflow/react";
import { Output } from "./OutputTypes";
import { Inputs } from "./InputTypes";

import ConstNode from "../components/nodes/code/ConstNode";
import ObjectNode from "../components/nodes/code/ObjectNode";
import ConditionalNode from "../components/nodes/code/ConditionalNode";
import MathNode from "../components/nodes/code/MathNode";
import FunctionNode from "../components/nodes/code/FunctionNode";
import PrintNode from "../components/nodes/code/PrintNode";
import RepeatNode from "../components/nodes/code/RepeatNode";

import GetNode from "../components/nodes/blockchain/GetNode";
import MintNode from "../components/nodes/blockchain/MintNode";
import TransferNode from "../components/nodes/blockchain/TransferNode";

import HeliusNode from "../components/nodes/provider/HeliusNode";
import BirdeyeNode from "../components/nodes/provider/BirdeyeNode";

/*
 * FRONTEND TYPES FOR NODES AND EDGES
 */

export type NodeCategory = 'Code' | 'Database' | 'Blockchain' | 'DeFi' | 'Provider' | 'Misc';

export interface NodeType {
  metadata: NodeTypeMetadata;
  defaultInputs?: Inputs;
  defaultOutput?: Output;
}

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
  REPEAT: RepeatNode,

  // Database

  // Blockchain
  GET: GetNode,
  MINT: MintNode,
  TRANSFER: TransferNode,

  // DeFi


  // Provider
  HELIUS: HeliusNode,
  BIRDEYE: BirdeyeNode,

  // Misc

} satisfies NodeTypes);

export const nodeTypes: Record<string, NodeType> = {

  /* ------------------------------------------------------------ */
  /* -------------------------- Code ---------------------------- */
  /* ------------------------------------------------------------ */

  CONST: {
    metadata: {
      id: 'CONST',
      label: 'CONST',
      category: 'Code',
      backgroundColor: 'bg-blue-500',
      borderColor: 'border-blue-700',
      primaryColor: 'blue-500',
      secondaryColor: 'blue-700',
      textColor: 'text-black'
    },
    defaultInputs: {
      dataType: {
        handleId: 'input-dataType',
        type: 'string',
        value: 'string'
      },
      value: {
        handleId: 'input-value',
        type: 'string',
        value: ''
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'string',
      value: ''
    }
  },
  OBJECT: { 
    metadata: {
      id: 'OBJECT', 
      label: 'OBJECT', 
      category: 'Code', 
      backgroundColor: 'bg-blue-400',
      borderColor: 'border-blue-600',
      primaryColor: 'blue-400', 
      secondaryColor: 'blue-600',
      textColor: 'text-black'
    },
    defaultInputs: {
      x: {
        handleId: 'input-x',
        type: 'string',
        value: ''
      },
      y: {
        handleId: 'input-y',
        type: 'string',
        value: ''
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'object',
      value: {}
    }
  },
  CONDITIONAL: {
    metadata: {
      id: 'CONDITIONAL',
      label: 'CONDITIONAL',
      category: 'Code',
      backgroundColor: 'bg-blue-300',
      borderColor: 'border-blue-500',
      primaryColor: 'blue-200',
      secondaryColor: 'blue-400',
      textColor: 'text-black'
    },
    defaultInputs: {},
    defaultOutput: {
      handleId: 'output',
      type: 'string',
      value: ''
    }
  },
  REPEAT: {
    metadata: {
      id: 'REPEAT',
      label: 'REPEAT',
      category: 'Code',
      backgroundColor: 'bg-blue-300',
      borderColor: 'border-blue-500',
      primaryColor: 'blue-300',
      secondaryColor: 'blue-500',
      textColor: 'text-black'
    },
    defaultInputs: {
      loopType: {
        handleId: 'input-loopType',
        type: 'string',
        value: 'for'
      },
      count: {
        handleId: 'input-count',
        type: 'number',
        value: 10
      },
      array: {
        handleId: 'input-array',
        type: 'string',
        value: ''
      },
      iteratorName: {
        handleId: 'input-iteratorName',
        type: 'string',
        value: 'i'
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'any',
      value: null
    }
  },
  MATH: {
    metadata: {
      id: 'MATH',
      label: 'MATH',
      category: 'Code',
      backgroundColor: 'bg-blue-200',
      borderColor: 'border-blue-400',
      primaryColor: 'blue-200',
      secondaryColor: 'blue-400',
      textColor: 'text-black'
    },
    defaultInputs: {
      function: {
        handleId: 'input-function',
        type: 'string',
        value: ''
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'string',
      value: ''
    }
  },
  FUNCTION: {
    metadata: {
      id: 'FUNCTION',
      label: 'FUNCTION',
      category: 'Code',
      backgroundColor: 'bg-gray-200',
      borderColor: 'border-gray-400',
      primaryColor: 'gray-200',
      secondaryColor: 'gray-400',
      textColor: 'text-black'
    },
    defaultInputs: {
      name: {
        handleId: 'input-name',
        type: 'string',
        value: 'Untitled Function'
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'string',
      value: ''
    }
  },
  PRINT: {
    metadata: {
      id: 'PRINT',
      label: 'PRINT',
      category: 'Code',
      backgroundColor: 'bg-yellow-200',
      borderColor: 'border-yellow-400',
      primaryColor: 'yellow-200',
      secondaryColor: 'yellow-400',
      textColor: 'text-black'
    },
    defaultInputs: {
      template: {
        handleId: 'input-template',
        type: 'string',
        value: ''
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'string',
      value: ''
    }
  },
  /* -------------------------------------------------------------- */
  /* -------------------------- Database -------------------------- */
  /* -------------------------------------------------------------- */

  /* -------------------------------------------------------------- */
  /* -------------------------- Blockchain ------------------------ */
  /* -------------------------------------------------------------- */

  GET: { 
    metadata: {
      id: 'GET', 
      label: 'GET', 
      category: 'Blockchain', 
      backgroundColor: 'bg-purple-400',
      borderColor: 'border-purple-600',
      primaryColor: 'purple-500', 
      secondaryColor: 'purple-700',
      textColor: 'text-black',
    },
    defaultInputs: {
      function: {
        handleId: 'input-function',
        type: 'string',
        value: ''
      },
      network: {
        handleId: 'input-network',
        type: 'string',
        value: 'devnet'
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'object',
      value: {}
    }
  },
  MINT: {
    metadata: {
      id: 'MINT',
      label: 'MINT',
      category: 'Blockchain',
      backgroundColor: 'bg-purple-300',
      borderColor: 'border-purple-500',
      primaryColor: 'purple-400',
      secondaryColor: 'purple-600',
      textColor: 'text-black'
    },
    defaultInputs: {
      name: {
        handleId: 'input-name',
        type: 'string',
        value: ''
      },
      symbol: { 
        handleId: 'input-symbol',
        type: 'string',
        value: ''
      },
      description: {
        handleId: 'input-description',
        type: 'string',
        value: ''
      },
      supply: {
        handleId: 'input-supply',
        type: 'number',
        value: 1000000000
      },
      image: {
        handleId: 'input-image',
        type: 'string',
        value: ''
      },
    },
    defaultOutput: {
      handleId: 'output',
      type: 'object',
      value: {}
    }
  },
  TRANSFER: {
    metadata: {
      id: 'TRANSFER',
      label: 'TRANSFER',
      category: 'Blockchain',
      backgroundColor: 'bg-purple-200',
      borderColor: 'border-purple-400',
      primaryColor: 'purple-300',
      secondaryColor: 'purple-500',
      textColor: 'text-black'
    },
    defaultInputs: {
      tokenAddress: {
        handleId: 'input-tokenAddress',
        type: 'string',
        value: ''
      },
      amount: {
        handleId: 'input-amount',
        type: 'number',
        value: 0
      },
      recipient: {
        handleId: 'input-recipient',
        type: 'string',
        value: ''
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'object',
      value: {}
    }
  },

  /* -------------------------------------------------------------- */
  /* -------------------------- DeFi ------------------------------ */
  /* -------------------------------------------------------------- */

  /* -------------------------------------------------------------- */
  /* -------------------------- Provider -------------------------- */
  /* -------------------------------------------------------------- */
  HELIUS: {
    metadata: {
      id: 'HELIUS',
      label: 'HELIUS',
      category: 'Provider',
      backgroundColor: 'bg-[#E84125]',
      borderColor: 'border-[#E84125]',
      primaryColor: '[#E84125]',
      secondaryColor: '[#E84125]',
      textColor: 'text-black',
    },
    defaultInputs: {
      function: {
        handleId: 'input-function',
        type: 'string',
        value: ''
      },
      network: {
        handleId: 'input-network',
        type: 'string',
        value: 'devnet'
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'object',
      value: {}
    }
  },
  BIRDEYE: {
    metadata: {
      id: 'BIRDEYE',
      label: 'BIRDEYE',
      category: 'Provider',
      backgroundColor: 'bg-[#fb8d05]',
      borderColor: 'border-[#fb8d05]',
      primaryColor: '[#fb8d05]',
      secondaryColor: '[#fb8d05]',
      textColor: 'text-black',
    },
    defaultInputs: {
      function: {
        handleId: 'input-function',
        type: 'string',
        value: ''
      }
    },
    defaultOutput: {
      handleId: 'output',
      type: 'object',
      value: {}
    }
  },

  /* -------------------------------------------------------------- */
  /* ---------------------------- Misc ---------------------------- */
  /* -------------------------------------------------------------- */

};