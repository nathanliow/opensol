import { Edge, Node } from '@xyflow/react';
import { Position } from '@xyflow/system';
import { InputDefinition, InputValueTypeString, InputValueType, Inputs } from '../types/InputTypes';
import { HandlePosition } from '../types/HandleTypes';
import { FlowNode } from '../../../backend/src/packages/compiler/src/types';
import { Output, OutputValueType, OutputValueTypeString } from '@/types/OutputTypes';

// Define handle style configuration
const HANDLE_STYLES = {
  base: {
    background: '#343434',
    borderColor: '#343434',
    backgroundColor: '#343434',
    borderRadius: 5,
    zIndex: -1,
  },
  positions: {
    left: { width: 15, height: 20, left: -5 },
    right: { width: 15, height: 20, right: -5 },
    top: { width: 40, height: 15, top: -3 },
    bottom: { width: 40, height: 15, bottom: -3 },
  }
};

/**
 * Utility functions for working with nodes and edges in the flow
 */
export const nodeUtils = {
  
  /**
   * Update a node's input data
   * @param nodeId - The id of the node to update
   * @param inputName - The name of the input to update
   * @param inputId - The id of the input to update
   * @param inputType - The type of the input to update
   * @param inputValue - The value to set the input to
   * @param setNodes - The React state setter function for nodes
   */
  updateNodeInput: (
    nodeId: string, 
    inputName: string, // name
    inputId: string,  // input-name
    inputType: InputValueTypeString | undefined, 
    inputValue: InputValueType | undefined,
    setNodes: (updater: (nodes: Node[]) => Node[]) => void
  ) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                inputs: {
                  ...(node.data.inputs as Record<string, any>),
                  [inputName]: {
                    handleId: inputId,
                    type: inputType === undefined ? (node.data.inputs as Record<string, any>)[inputName]?.type : inputType,
                    value: inputValue === undefined ? (node.data.inputs as Record<string, any>)[inputName]?.value : inputValue
                  }
                }
              }
            }
          : node
      )
    );
  },

  /**
   * Update a node's output data
   * @param nodeId - The id of the node to update
   * @param outputType - The type of the output to update
   * @param outputValue - The value to set the output to
   * @param setNodes - The React state setter function for nodes
   */
  updateNodeOutput: (
    nodeId: string, 
    outputType: OutputValueTypeString, 
    outputValue: OutputValueType,
    setNodes: (updater: (nodes: Node[]) => Node[]) => void
  ) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                output: {
                  handleId: 'output',
                  type: outputType,
                  value: outputValue
                }
              }
            }
          : node
      )
    );
  },
  
  /**
   * Get node data by id
   * @param nodes - The array of nodes to search
   * @param id - The id of the node to find
   * @returns The found node or undefined
   */
  getFlowNode: (nodes: Node[], id: string): FlowNode | undefined => {
    return nodes.find(node => node.id === id) as FlowNode | undefined;
  },

  /**
   * Get a value from node data with optional default
   */
  getValue: (data: Inputs | undefined, id: string, defaultValue: any = null): any => {
    if (!data) return defaultValue;
    
    // First, try to find by the input ID directly
    if (data[id] !== undefined) {
      // If it's an object with a value property, return the value
      if (typeof data[id] === 'object' && data[id] !== null && 'value' in data[id]) {
        return (data[id] as any).value;
      }
      // Otherwise return the value directly
      return data[id];
    }
    
    // If not found by ID, try to find by handleId
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null && 'handleId' in value) {
        if ((value as any).handleId === id) {
          return (value as any).value;
        }
      }
    }
    
    return defaultValue;
  },

  /**
   * Check if an input has a connected value
   */
  isInputConnected: (input: InputDefinition): boolean => {
    const connectedValue = input.getConnectedValue?.();
    return connectedValue !== null && connectedValue !== undefined;
  },

  /**
   * Get the connected value for an input or return null
   */
  getConnectedValue: (input: InputDefinition): any => {
    return input.getConnectedValue?.() ?? null;
  },

  /**
   * Convert a HandlePosition to a ReactFlow Position
   */
  toReactFlowPosition: (position: HandlePosition): Position => {
    switch (position) {
      case 'left': return Position.Left;
      case 'right': return Position.Right;
      case 'top': return Position.Top;
      case 'bottom': return Position.Bottom;
      default: return Position.Left;
    }
  },

  /**
   * Get handle style for a specific position
   */
  getHandleStyle: (position: HandlePosition, offsetY: number = 0) => {
    const style = {
      ...HANDLE_STYLES.base,
      ...HANDLE_STYLES.positions[position],
    } as any;
  
    return style;
  },

  /**
   * Validate flow connections
   */
  validateFlowConnection: (connection: any) => {
    return connection.targetHandle === 'flow-bottom' || connection.targetHandle === 'flow-top';
  },

  /**
   * Validate output connections
   */
  validateOutputConnection: (connection: any) => {
    return connection.targetHandle?.startsWith('input-');;
  },

  /**
   * Find all edges connected to a node (either as source or target)
   */
  findConnectedEdges: (edges: Edge[], nodeId: string): Edge[] => {
    return edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
  },

  /**
   * Find all edges where the node is the source
   */
  findOutgoingEdges: (edges: Edge[], nodeId: string): Edge[] => {
    return edges.filter(edge => edge.source === nodeId);
  },

  /**
   * Find all edges where the node is the target
   */
  findIncomingEdges: (edges: Edge[], nodeId: string): Edge[] => {
    return edges.filter(edge => edge.target === nodeId);
  },

  /**
   * Find the source node for a given input on a target node
   */
  findSourceNodeForInput: (
    nodes: Node[],
    edges: Edge[],
    targetNodeId: string,
    inputId: string
  ): Node | undefined => {
    const edge = edges.find(
      edge => edge.target === targetNodeId && edge.targetHandle === inputId
    );
    
    if (!edge) return undefined;
    
    return nodes.find(node => node.id === edge.source);
  },

  /**
   * Get the source node's output value for a given input
   * For flow-wide operations with multiple nodes
   */
  getConnectedValueFromNodes: (
    nodes: Node[],
    edges: Edge[],
    targetNodeId: string,
    inputId: string
  ): any => {
    const sourceNode = nodeUtils.findSourceNodeForInput(nodes, edges, targetNodeId, inputId);
    return sourceNode?.data?.outputValue;
  },

  /**
   * Check if a node's input is connected
   * For flow-wide operations with multiple nodes
   */
  isInputConnectedInFlow: (
    edges: Edge[],
    nodeId: string,
    inputId: string
  ): boolean => {
    return edges.some(edge => edge.target === nodeId && edge.targetHandle === inputId);
  },

  /**
   * Find nodes that are connected to a node's output
   */
  findNodesConnectedToOutput: (
    nodes: Node[],
    edges: Edge[],
    sourceNodeId: string
  ): Node[] => {
    const connectedNodeIds = edges
      .filter(edge => edge.source === sourceNodeId && edge.sourceHandle === 'output')
      .map(edge => edge.target);
    
    return nodes.filter(node => connectedNodeIds.includes(node.id));
  },

  /**
   * Create input definitions from a schema
   */
  createInputsFromSchema: (
    schema: Record<string, {
      type: string;
      description?: string;
      default?: any;
      enum?: any[];
      options?: { value: string; label: string }[];
    }>
  ): InputDefinition[] => {
    return Object.entries(schema).map(([id, field]) => {
      const inputType = field.type === 'select' ? 'dropdown' : 
                       (field.type === 'number' ? 'number' : 'text');
      
      return {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        type: inputType as any, // Type assertion to fix type issues
        description: field.description,
        defaultValue: field.default,
        options: inputType === 'dropdown' ? (
          field.options || 
          (field.enum?.map(value => ({ value: String(value), label: String(value) })) || [])
        ) : undefined,
        placeholder: field.description
      };
    });
  },

  /**
   * Create a node output definition from a schema
   */
  createOutputFromSchema: (
    schema: {
      type: string;
      description?: string;
    }
  ): any => {
    const outputType = schema.type === 'number' || schema.type === 'integer' ? 'number' :
                      schema.type === 'boolean' ? 'boolean' :
                      schema.type === 'object' ? 'object' :
                      schema.type === 'array' ? 'any[]' : 'string';
    
    return {
      type: outputType,
      description: schema.description || `Output of type ${outputType}`
    };
  },

  /**
   * Get a traversable execution path starting from a node
   * Returns an array of nodes in execution order
   */
  getExecutionPath: (
    nodes: FlowNode[],
    edges: Edge[],
    startNodeId: string
  ): FlowNode[] => {
    const result: FlowNode[] = [];
    const visited = new Set<string>();
    const startNode = nodeUtils.getFlowNode(nodes, startNodeId);
    
    if (!startNode) return result;
    
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      
      const node = nodeUtils.getFlowNode(nodes, nodeId);
      if (!node) return;
      
      visited.add(nodeId);
      result.push(node);
      
      // Find flow connections (edges from 'flow-bottom' to 'flow-top')
      const nextEdges = edges.filter(edge => 
        edge.source === nodeId && 
        edge.sourceHandle === 'flow-bottom' &&
        edge.targetHandle === 'flow-top'
      );
      
      nextEdges.forEach(edge => {
        traverse(edge.target);
      });
    };
    
    traverse(startNodeId);
    return result;
  },

  /**
   * Get the connected value for a specific input parameter by node ID and parameter name
   * @param edges - The array of edges in the flow
   * @param nodes - The array of nodes in the flow
   * @param nodeId - The ID of the node receiving the input
   * @param paramName - The name of the parameter
   * @returns The output value from the connected node, or null if not connected
   */
  getConnectedValueById: (
    edges: Edge[],
    nodes: Node[],
    nodeId: string,
    paramName: string
  ): any => {
    const edge = edges.find(e => 
      e.target === nodeId && 
      e.targetHandle === `input-${paramName}`
    );
    
    if (!edge) return null;

    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode) return null;
    
    return sourceNode.data.output ? (sourceNode.data.output as any).value : null;
  },

  /**
   * Creates a connection getter function for a specific node and parameter
   * @param edges - The array of edges in the flow
   * @param nodes - The array of nodes in the flow 
   * @param nodeId - The ID of the node receiving the input
   * @param paramName - The name of the parameter
   * @returns A function that returns the connected value
   */
  createConnectionGetter: (
    edges: Edge[],
    nodes: Node[],
    nodeId: string,
    paramName: string
  ) => {
    return () => nodeUtils.getConnectedValueById(edges, nodes, nodeId, paramName);
  },

  /**
   * Get the node data for a given node ID
   * @param nodes - The array of nodes in the flow
   * @param id - The ID of the node to get data for
   * @returns The node data
   */
  getNodeData: (nodes: FlowNode[], id: string): { 
    inputs: Inputs, 
    output: Output 
  } => {
    const node = nodes.find(n => n.id === id);
    if (node && node.data) {
      const data = node.data as any;
      return {
        inputs: (data.inputs || {}) as Inputs,
        output: (data.output || { handleId: 'output', type: 'string', value: '' }) as Output,
      };
    }
    // Fallback when node/data missing
    return {
      inputs: {} as Inputs,
      output: { handleId: 'output', type: 'string', value: '' } as Output,
    };
  },

  /**
   * Comprehensive connection validation for the Canvas
   * Combines flow validation, type checking, and handle compatibility
   * Used for showing valid handles to connect to 
   */
  validateConnection: (connection: any, nodes: FlowNode[]): boolean => {
    if (!connection.source || !connection.target) return false;

    // Can't connect node to itself
    if (connection.source === connection.target) return false;

    // Connections between flow handles (top to bottom, vice versa) are always valid
    if (connection.sourceHandle === "flow-bottom" && connection.targetHandle === "flow-top") {
      return true;
    }
    if (connection.sourceHandle === "flow-top" && connection.targetHandle === "flow-bottom") {
      return true;
    }

    // Handle flow-then and flow-else connections to flow-top
    if ((connection.sourceHandle === "flow-then" || connection.sourceHandle === "flow-else") && 
        connection.targetHandle === "flow-top") {
      return true;
    }

    // Connections between flow handles and input or output handles are not valid
    if (connection.sourceHandle === "flow-top" && (connection.targetHandle?.startsWith("input-") || connection.targetHandle?.startsWith("output"))) {
      return false;
    }
    if (connection.targetHandle === "flow-top" && (connection.sourceHandle?.startsWith("input-") || connection.sourceHandle?.startsWith("output"))) {
      return false;
    }
    if (connection.sourceHandle === "flow-bottom" && (connection.targetHandle?.startsWith("input-") || connection.targetHandle?.startsWith("output"))) {
      return false;
    }
    if (connection.targetHandle === "flow-bottom" && (connection.sourceHandle?.startsWith("input-") || connection.sourceHandle?.startsWith("output"))) {
      return false;
    }

    // Additional check for flow-then/flow-else handles
    if ((connection.sourceHandle === "flow-then" || connection.sourceHandle === "flow-else") && 
        (connection.targetHandle?.startsWith("input-") || connection.targetHandle?.startsWith("output"))) {
      return false;
    }

    // Find the nodes involved in the connection
    const sourceNode = nodes.find((node: FlowNode) => node.id === connection.source);
    const targetNode = nodes.find((node: FlowNode) => node.id === connection.target);
    
    if (!sourceNode || !targetNode) return false;
    
    // Determine the type of the source handle (output)
    const outputType = sourceNode.data?.output?.type || 'any';
    
    // Find the target input handle and its expected type
    const targetInput = Object.values(targetNode.data?.inputs || {}).find((input: any) => 
      input.handleId === connection.targetHandle || input.id === connection.targetHandle
    );
    
    // If no matching input found, or if it's a flow connection (which are always valid)
    if (!targetInput) {
      // For flow connections (top/bottom handles), always valid
      if (connection.targetHandle === 'flow-top' || connection.targetHandle === 'flow-bottom') {
        return true;
      }
      return false;
    }
    
    // Type compatibility rules
    // 'any' type is compatible with any input
    if (outputType === 'any') return true;
 
    const targetType = targetInput ? (targetInput as any).type || 'any' : 'any';
    
    switch (outputType) {
      case 'string':
        return ['string', 'any', 'object'].includes(targetType as string);
      
      case 'number':
        return ['number', 'any', 'object'].includes(targetType as string);
      
      case 'boolean':
        return ['boolean', 'any', 'object'].includes(targetType as string);
      
      case 'object':
        return ['object', 'any'].includes(targetType as string);
      
      case 'array':
        return ['array', 'object', 'any'].includes(targetType as string);
      
      default:
        return false;
    }
  },
}; 