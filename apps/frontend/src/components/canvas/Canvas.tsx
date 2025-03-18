"use client";

import { useCallback, useState, useRef } from "react";
import {
  Background,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { initialNodes } from "../nodes/InitialNodes";
import { initialEdges } from "../edges/InitialEdges";
import { edgeTypes } from "../../types/EdgeTypes";
import { nodeTypes } from "../../types/NodeTypes";
import Toolbar from "./Toolbar";
import Menu from "./Menu";

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeTypes, setShowNodeTypes] = useState(false);
  const nodeTypesRef = useRef(null);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const proOptions = { hideAttribution: true };

  const toggleNodeTypesDropdown = useCallback(() => {
    setShowNodeTypes(!showNodeTypes);
  }, [showNodeTypes]);

  // Define example node types for the dropdown
  const availableNodeTypes = [
    { id: 'GET', label: 'GET' },
    { id: 'SEND', label: 'SEND' },
    { id: 'MINT', label: 'MINT' },
    { id: 'PRINT', label: 'PRINT' },
    { id: 'custom', label: 'Custom Node' },
    { id: 'custom', label: 'Custom Node' },
    { id: 'custom', label: 'Custom Node' },
    { id: 'custom', label: 'Custom Node' },
  ];

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

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={proOptions}
        fitView
      >
        <Background />
        <Toolbar
          showNodeTypes={showNodeTypes}
          toggleNodeTypesDropdown={toggleNodeTypesDropdown}
          availableNodeTypes={availableNodeTypes}
          addNewNode={addNewNode}
        />
        <Menu />
      </ReactFlow>
    </div>
  );
}
