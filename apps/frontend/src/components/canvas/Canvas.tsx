"use client";

import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  useReactFlow,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "../../types/EdgeTypes";
import { createNodeTypes, nodeTypesData } from "../../types/NodeTypes";
import Toolbar from "./Toolbar";
import Console from "../console/Console";
import Menu from "./Menu";
import { saveCanvasChanges, getProject } from "@/lib/projects";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import LoadingAnimation from "@/components/loading/LoadingAnimation";

// Internal component that uses ReactFlow hooks
function Flow() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNodeTypes, setShowNodeTypes] = useState(false);
  const [debug, setDebug] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectLoadedRef = useRef(false); // Add a ref to track if project was loaded
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const { supabaseUser } = useUserAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);

  // Create node types with setNodes
  const nodeTypes = useMemo(() => createNodeTypes(setNodes), [setNodes]);

  // Handle project change notification from Menu component
  const handleProjectChange = useCallback(() => {
    projectLoadedRef.current = false; // Reset the project loaded state
    setIsLoading(true);               // Set loading state to trigger a reload
  }, []);

  // Load project from localStorage
  useEffect(() => {
    const loadProjectFromStorage = async () => {
      // If we've already loaded this project, don't reload it
      if (!supabaseUser || (projectLoadedRef.current && !localStorage.getItem('forceProjectReload'))) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Clear the force reload flag if it exists
        if (localStorage.getItem('forceProjectReload')) {
          localStorage.removeItem('forceProjectReload');
        }
        
        const storedProjectId = localStorage.getItem('currentProjectId');
        
        if (storedProjectId) {
          setProjectId(storedProjectId);
          
          // Fetch project data from Supabase
          const projectData = await getProject(storedProjectId);
          setProjectData(projectData); // Store project data
          
          // Check if user has access to this project (either as owner or public project)
          if (projectData?.user_id === supabaseUser.id || projectData?.is_public === true) {
            // Set ownership flag
            setIsProjectOwner(projectData?.user_id === supabaseUser.id);
            
            // Ensure we're setting completely new arrays to trigger React re-renders
            setNodes(projectData.nodes ? [...projectData.nodes] : []);
            setEdges(projectData.edges ? [...projectData.edges] : []);
          } else {
            console.warn('User does not have access to this project');
            localStorage.removeItem('currentProjectId');
            setNodes([]);
            setEdges([]);
          }
        } else {
          // No project ID in localStorage, use empty canvas
          setNodes([]);
          setEdges([]);
          setProjectId(null);
          setIsProjectOwner(true); // User can edit new projects
        }
      } catch (error) {
        console.error('Error loading project:', error);
        // Clear localStorage on error
        localStorage.removeItem('currentProjectId');
        setNodes([]);
        setEdges([]);
        setProjectId(null);
        setIsProjectOwner(true); // User can edit new projects
      } finally {
        setIsLoading(false);
        projectLoadedRef.current = true; // Mark as loaded even on error to prevent retry loops
      }
    };
    
    loadProjectFromStorage();
    
    // Cleanup function to reset the loading flag if component unmounts
    return () => {
      projectLoadedRef.current = false;
    };
  }, [supabaseUser, setNodes, setEdges, isLoading]); // Add isLoading dependency to reload when it changes

  // Auto-save changes to Supabase
  useEffect(() => {
    // Only save if we have a project ID and nodes/edges have changed
    // AND the user owns the project (not just viewing a public one)
    if (!projectId || !supabaseUser || isLoading || !projectLoadedRef.current) return;
    
    // Check if user owns this project before saving
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (storedProjectId !== projectId) return; // Safety check
    
    // Get project data to verify ownership
    const checkProjectOwnership = async () => {
      try {
        const projectData = await getProject(projectId);
        
        // Only save if user is the owner
        if (projectData?.user_id !== supabaseUser.id) {
          return;
        }
        
        // Debounce saves to prevent too many API calls
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        saveTimeoutRef.current = setTimeout(() => {
          saveCanvasChanges(projectId, nodes, edges).catch(err => {
            console.error('Failed to save canvas changes:', err);
          });
        }, 2000); // 2 second debounce
      } catch (error) {
        console.error('Error checking project ownership:', error);
      }
    };
    
    checkProjectOwnership();
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, edges, projectId, supabaseUser, isLoading]);

  const handleClear = useCallback(() => {
    setOutput('');
    setCode('');
    setDebug('');
  }, []);

  const handleExport = useCallback(() => {
    const flow = {
      nodes,
      edges,
      viewport: reactFlowInstance.getViewport()
    };
    return flow;
  }, [nodes, edges, reactFlowInstance]);

  const handleImport = useCallback((flowData: any) => {
    const { nodes: importedNodes, edges: importedEdges, viewport } = flowData;
    setNodes(importedNodes);
    setEdges(importedEdges);
    reactFlowInstance.setViewport(viewport);
  }, [setNodes, setEdges, reactFlowInstance]);

  const toggleSelectionMode = useCallback(() => {
    if (!isProjectOwner) return; // Prevent mode toggle if not owner
    setSelectionMode(prev => !prev);
  }, [isProjectOwner]);

  const addNewNode = useCallback((type: string, position?: { x: number; y: number }) => {
    if (!isProjectOwner) return; // Prevent edits if not owner
    
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
  }, [setNodes, isProjectOwner]);

  const toggleNodeTypesDropdown = useCallback(() => {
    setShowNodeTypes(!showNodeTypes);
  }, [showNodeTypes]);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!isProjectOwner) return; // Prevent edits if not owner
      setEdges((edges) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: {
          strokeWidth: 2,
          stroke: 'white',
        },
      }, edges));
    },
    [setEdges, isProjectOwner]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!isProjectOwner || !reactFlowWrapper.current) return;

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

      // Add the new node at the drop position
      addNewNode(type, position);
    },
    [isProjectOwner, reactFlowInstance, addNewNode]
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  const proOptions = { hideAttribution: true };

  return (
    <div className="w-full h-screen" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={isProjectOwner ? onNodesChange : undefined}
        onEdgesChange={isProjectOwner ? onEdgesChange : undefined}
        onConnect={isProjectOwner ? onConnect : undefined}
        onDrop={isProjectOwner ? onDrop : undefined}
        onDragOver={onDragOver}
        panOnDrag={true}
        selectionMode={selectionMode ? SelectionMode.Full : SelectionMode.Partial}
        proOptions={{
          hideAttribution: true
        }}
        fitView
      >
        <Background />
        <Toolbar
          showNodeTypes={showNodeTypes}
          toggleNodeTypesDropdown={toggleNodeTypesDropdown}
          nodeTypesData={nodeTypesData}
          addNewNode={addNewNode}
          selectionMode={selectionMode}
          toggleSelectionMode={toggleSelectionMode}
          isReadOnly={!isProjectOwner}
        />
        <Menu
          onExport={handleExport}
          onImport={handleImport}
          projectId={projectId}
          onProjectChange={handleProjectChange}
          isProjectOwner={isProjectOwner}
          projectData={projectData}
        />
        <Console 
          output={output} 
          code={code}
          debug={debug}
          onOutput={setOutput}
          onCodeGenerated={setCode}
          onDebugGenerated={setDebug}
          onClear={handleClear}
          onRestoreFlow={(restoredNodes, restoredEdges) => {            
            setNodes(restoredNodes);
            setEdges(restoredEdges);
          }}
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