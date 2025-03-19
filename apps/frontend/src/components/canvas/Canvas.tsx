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
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { initialNodes } from "../nodes/InitialNodes";
import { initialEdges } from "../edges/InitialEdges";
import { edgeTypes } from "../../types/edgeTypes";
import { createNodeTypes, nodeTypesData } from "../../types/nodeTypes";
import Toolbar from "./Toolbar";
import Console from "../console/Console";
import RunButton from "./RunButton";
import Menu from "./Menu";

// Internal component that uses ReactFlow hooks
function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeTypes, setShowNodeTypes] = useState(false);
  const [debug, setDebug] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Create node types with setNodes
  const nodeTypes = useMemo(() => createNodeTypes(setNodes), [setNodes]);

  const handleClear = useCallback(() => {
    setOutput('');
    setCode('');
    setDebug('');
  }, []);

  const addNewNode = useCallback((type: any) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: type,
      position: { x: 250, y: 250 },
      data: { label: `New ${type} node` },
    };
  
    setNodes((nds) => [...nds, newNode]);
    setShowNodeTypes(false);
  }, [setNodes]);

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

      // Get the current ReactFlow instance to access the screenToFlowPosition function
      const flowInstance = document.querySelector('.react-flow');
      if (!flowInstance) return;

      // Calculate position manually if needed
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type.toLowerCase()}-${Date.now()}`,
        type,
        position,
        data: type === 'LABEL' 
          ? { name: 'Untitled Logic', label: 'LABEL' }
          : { label: type, selectedFunction: '', parameters: {} }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
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
        fitView
      >
        <Toolbar
          showNodeTypes={showNodeTypes}
          toggleNodeTypesDropdown={toggleNodeTypesDropdown}
          nodeTypesData={nodeTypesData}
          addNewNode={addNewNode}
        />
        <Menu />
        <Background />
      </ReactFlow>

      <Panel position="bottom-right">
        <RunButton 
          onOutput={setOutput} 
          onCodeGenerated={setCode}
          onDebugGenerated={setDebug}
          selectedLabel={selectedLabel} 
        />
        <Console 
          output={output} 
          code={code}
          debug={debug}
          onLabelSelect={setSelectedLabel} 
          onClear={handleClear}
        />
      </Panel>
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