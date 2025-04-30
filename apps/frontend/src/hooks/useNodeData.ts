import { useState, useCallback, useEffect } from 'react';
import { useNodes, useEdges } from '@xyflow/react';
import { InputDefinition } from '../types/InputTypes';
import { nodeUtils } from '../utils/nodeUtils';

/**
 * Hook for managing node data and input/output connections
 */
export function useNodeData(nodeId: string) {
  const nodes = useNodes();
  const edges = useEdges();
  const [data, setData] = useState<Record<string, any>>({});
  const [outputValue, setOutputValue] = useState<any>(null);
  
  // Get current node
  const node = nodeUtils.findNodeById(nodes, nodeId);
  
  // Update local data when node data changes
  useEffect(() => {
    if (node?.data) {
      setData(node.data);
      
      // If node has outputValue, update it
      if (node.data.outputValue !== undefined) {
        setOutputValue(node.data.outputValue);
      }
    }
  }, [node?.data]);
  
  /**
   * Update a specific input value
   */
  const updateInputValue = useCallback((inputId: string, value: any) => {
    setData(prev => ({
      ...prev,
      [inputId]: value
    }));
  }, []);
  
  /**
   * Update multiple input values at once
   */
  const updateInputValues = useCallback((values: Record<string, any>) => {
    setData(prev => ({
      ...prev,
      ...values
    }));
  }, []);
  
  /**
   * Set the node's output value
   */
  const updateOutputValue = useCallback((value: any) => {
    setOutputValue(value);
    setData(prev => ({
      ...prev,
      outputValue: value
    }));
  }, []);
  
  /**
   * Check if an input is connected to another node
   */
  const isInputConnected = useCallback((inputId: string) => {
    return nodeUtils.isInputConnected(edges, nodeId, inputId);
  }, [edges, nodeId]);
  
  /**
   * Get the value of a connected input
   */
  const getConnectedValue = useCallback((inputId: string) => {
    return nodeUtils.getConnectedValue(nodes, edges, nodeId, inputId);
  }, [nodes, edges, nodeId]);
  
  /**
   * Create a function that gets connected value for an input definition
   */
  const createGetConnectedValueFn = useCallback((inputId: string) => {
    return () => getConnectedValue(inputId);
  }, [getConnectedValue]);
  
  /**
   * Enhance input definitions with connected value getters
   */
  const enhanceInputDefinitions = useCallback((inputs: InputDefinition[]): InputDefinition[] => {
    return inputs.map(input => ({
      ...input,
      getConnectedValue: createGetConnectedValueFn(input.id)
    }));
  }, [createGetConnectedValueFn]);
  
  /**
   * Find nodes that are connected to this node's output
   */
  const getOutputConnectedNodes = useCallback(() => {
    return nodeUtils.findNodesConnectedToOutput(nodes, edges, nodeId);
  }, [nodes, edges, nodeId]);
  
  /**
   * Find source node for a specific input
   */
  const getSourceNodeForInput = useCallback((inputId: string) => {
    return nodeUtils.findSourceNodeForInput(nodes, edges, nodeId, inputId);
  }, [nodes, edges, nodeId]);
  
  /**
   * Get all incoming edges for this node
   */
  const getIncomingEdges = useCallback(() => {
    return nodeUtils.findIncomingEdges(edges, nodeId);
  }, [edges, nodeId]);
  
  /**
   * Get all outgoing edges for this node
   */
  const getOutgoingEdges = useCallback(() => {
    return nodeUtils.findOutgoingEdges(edges, nodeId);
  }, [edges, nodeId]);
  
  /**
   * Get next node in execution path (via flow-bottom to flow-top connection)
   */
  const getNextNode = useCallback(() => {
    const outgoingFlowEdges = edges.filter(edge => 
      edge.source === nodeId && 
      edge.sourceHandle === 'flow-bottom' &&
      edge.targetHandle === 'flow-top'
    );
    
    if (outgoingFlowEdges.length === 0) return null;
    
    const nextNodeId = outgoingFlowEdges[0].target;
    return nodeUtils.findNodeById(nodes, nextNodeId);
  }, [nodes, edges, nodeId]);
  
  /**
   * Get previous node in execution path (via flow-bottom to flow-top connection)
   */
  const getPreviousNode = useCallback(() => {
    const incomingFlowEdges = edges.filter(edge => 
      edge.target === nodeId && 
      edge.targetHandle === 'flow-top' &&
      edge.sourceHandle === 'flow-bottom'
    );
    
    if (incomingFlowEdges.length === 0) return null;
    
    const prevNodeId = incomingFlowEdges[0].source;
    return nodeUtils.findNodeById(nodes, prevNodeId);
  }, [nodes, edges, nodeId]);
  
  return {
    node,
    data,
    outputValue,
    updateInputValue,
    updateInputValues,
    updateOutputValue,
    isInputConnected,
    getConnectedValue,
    createGetConnectedValueFn,
    enhanceInputDefinitions,
    getOutputConnectedNodes,
    getSourceNodeForInput,
    getIncomingEdges,
    getOutgoingEdges,
    getNextNode,
    getPreviousNode
  };
} 