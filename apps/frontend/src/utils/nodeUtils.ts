import { Edge, Node } from '@xyflow/react';
import { InputDefinition } from '../types/InputTypes';
import { NodeOutput } from '../components/nodes/TemplateNode';

/**
 * Utility functions for working with nodes and edges in the flow
 */
export const nodeUtils = {
  /**
   * Find a node by its id
   */
  findNodeById: (nodes: Node[], nodeId: string): Node | undefined => {
    return nodes.find(node => node.id === nodeId);
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
   */
  getConnectedValue: (
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
   */
  isInputConnected: (
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
        type: inputType,
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
  ): NodeOutput => {
    const outputType = schema.type === 'number' || schema.type === 'integer' ? 'number' :
                      schema.type === 'boolean' ? 'boolean' :
                      schema.type === 'object' ? 'object' :
                      schema.type === 'array' ? 'any[]' : 'string';
    
    return {
      type: outputType as any,
      description: schema.description || `Output of type ${outputType}`
    };
  },

  /**
   * Get a traversable execution path starting from a node
   * Returns an array of nodes in execution order
   */
  getExecutionPath: (
    nodes: Node[],
    edges: Edge[],
    startNodeId: string
  ): Node[] => {
    const result: Node[] = [];
    const visited = new Set<string>();
    const startNode = nodeUtils.findNodeById(nodes, startNodeId);
    
    if (!startNode) return result;
    
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      
      const node = nodeUtils.findNodeById(nodes, nodeId);
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
  }
}; 