import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { FlowNode, FlowEdge } from '../../../backend/src/packages/compiler/src/types';

interface HistoryState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveState: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  clearHistory: () => void;
  isApplyingHistory: () => boolean;
}

const MAX_HISTORY_SIZE = 30;

export function useUndoRedo(
  setNodes: (nodes: FlowNode[]) => void,
  setEdges: (edges: FlowEdge[]) => void
): UseUndoRedoReturn {
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<HistoryState[]>([]);
  const isApplyingHistoryRef = useRef(false);

  const saveState = useCallback((nodes: FlowNode[], edges: FlowEdge[]) => {
    // Don't save state if we're currently applying history
    if (isApplyingHistoryRef.current) return;

    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
      edges: JSON.parse(JSON.stringify(edges)), // Deep clone
    };

    // Remove any future history if we're not at the end
    if (historyIndex < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndex + 1);
    }

    // Add new state
    historyRef.current.push(newState);

    // Limit history size
    if (historyRef.current.length > MAX_HISTORY_SIZE) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY_SIZE);
      setHistoryIndex(MAX_HISTORY_SIZE - 1);
    } else {
      setHistoryIndex(historyRef.current.length - 1);
    }
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = historyRef.current[newIndex];
      
      isApplyingHistoryRef.current = true;
      
      // Use flushSync to ensure state updates happen immediately
      flushSync(() => {
        setNodes(state.nodes);
        setEdges(state.edges);
        setHistoryIndex(newIndex);
      });
      
      // Reset flag after a short delay
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 150);
    }
  }, [historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < historyRef.current.length - 1) {
      const newIndex = historyIndex + 1;
      const state = historyRef.current[newIndex];
      
      isApplyingHistoryRef.current = true;
      
      // Use flushSync to ensure state updates happen immediately
      flushSync(() => {
        setNodes(state.nodes);
        setEdges(state.edges);
        setHistoryIndex(newIndex);
      });
      
      // Reset flag after a short delay
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 150);
    }
  }, [historyIndex, setNodes, setEdges]);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setHistoryIndex(-1);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyRef.current.length - 1;

  const isApplyingHistory = useCallback(() => {
    return isApplyingHistoryRef.current;
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    clearHistory,
    isApplyingHistory,
  };
} 