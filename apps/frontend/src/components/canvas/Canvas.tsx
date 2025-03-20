"use client";

import { useCallback, useState, useRef, useMemo } from "react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  useReactFlow,
  useViewport,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { initialNodes } from "../nodes/InitialNodes";
import { initialEdges } from "../edges/InitialEdges";
import { edgeTypes } from "../../types/edgeTypes";
import { createNodeTypes, nodeTypesData } from "../../types/nodeTypes";
import Toolbar from "./Toolbar";
import Console from "../console/Console";
import Menu from "./Menu";

// Internal component that uses ReactFlow hooks
function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeTypes, setShowNodeTypes] = useState(false);
  const [debug, setDebug] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);

  // Create node types with setNodes
  const nodeTypes = useMemo(() => createNodeTypes(setNodes), [setNodes]);

  const handleClear = useCallback(() => {
    setOutput('');
    setCode('');
    setDebug('');
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
  }, []);

  const addNewNode = useCallback((type: string, position?: { x: number; y: number }) => {
    // If position is provided, use it; otherwise use viewport center
    let nodePosition = position;

    const newNode = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      position: nodePosition || { x: 0, y: 0 },
      data: type === 'FUNCTION' 
        ? { name: 'Untitled Function', label: 'FUNCTION' }
        : { label: type, selectedFunction: '', parameters: {} }
    };
  
    setNodes((nds) => [...nds, newNode]);
    setShowNodeTypes(false);
  }, [reactFlowInstance, setNodes]);

  const toggleNodeTypesDropdown = useCallback(() => {
    setShowNodeTypes(!showNodeTypes);
  }, [showNodeTypes]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowBounds) {
        return;
      }

      // Calculate position in flow coordinates
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });

      // Create the new node at the drop position
      addNewNode(type, position);
    },
    [reactFlowInstance, addNewNode]
  );

  const proOptions = { hideAttribution: true };

  return (
    <div className="w-full h-screen" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        selectionMode={selectionMode ? SelectionMode.Partial : SelectionMode.Full}
        selectionOnDrag={selectionMode}
        panOnDrag={!selectionMode}
        fitView
      >
        <Toolbar
          showNodeTypes={showNodeTypes}
          toggleNodeTypesDropdown={toggleNodeTypesDropdown}
          nodeTypesData={nodeTypesData}
          addNewNode={addNewNode}
          selectionMode={selectionMode}
          toggleSelectionMode={toggleSelectionMode}
        />
        <Menu />
        <Background />
        <Console 
          output={output} 
          code={code}
          debug={debug}
          onOutput={setOutput}
          onCodeGenerated={setCode}
          onDebugGenerated={setDebug}
          onClear={handleClear}
        />
      </ReactFlow>
    </div>
  );
}

// Wrapper component that provides the ReactFlow context
export default function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}