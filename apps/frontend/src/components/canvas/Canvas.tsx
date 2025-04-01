"use client";

import { 
  useCallback, 
  useState, 
  useRef, 
  useMemo, 
  useEffect 
} from "react";
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
  Edge,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "../../types/EdgeTypes";
import { 
  createNodeTypes, 
  nodeTypesData 
} from "../../types/NodeTypes";
import Toolbar from "./Toolbar";
import NodeSidebar from "./NodeSidebar";
import Console from "../console/Console";
import Menu from "./Menu";
import { 
  saveCanvasChanges, 
  getProject 
} from "@/lib/projects";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { Icons } from "../icons/icons";

// Internal component that uses ReactFlow hooks
function Flow() {
  // State variables
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [debug, setDebug] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectLoadedRef = useRef(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Hooks
  const reactFlowInstance = useReactFlow();
  const { supabaseUser } = useUserAccountContext();
  
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
        if (localStorage.getItem('forceProjectReload')) {
          localStorage.removeItem('forceProjectReload');
        }
        
        const storedProjectId = localStorage.getItem('currentProjectId');
        
        if (storedProjectId) {
          setProjectId(storedProjectId);
          
          const projectData = await getProject(storedProjectId);
          setProjectData(projectData); 
          
          // Check if user has access to this project (either as owner or public project)
          if (projectData?.user_id === supabaseUser.id || projectData?.is_public === true) {
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
          setIsProjectOwner(true); 
        }
      } catch (error) {
        console.error('Error loading project:', error);
        // Clear localStorage on error
        localStorage.removeItem('currentProjectId');
        setNodes([]);
        setEdges([]);
        setProjectId(null);
        setIsProjectOwner(true);
      } finally {
        setIsLoading(false);
        projectLoadedRef.current = true; // Mark as loaded even on error to prevent retry loops
      }
    };
    
    loadProjectFromStorage();
    
    return () => {
      projectLoadedRef.current = false;
    };
  }, [supabaseUser, setNodes, setEdges, isLoading]);

  // Auto-save changes to Supabase
  useEffect(() => {
    if (!projectId || !supabaseUser || isLoading || !projectLoadedRef.current) return;
    
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (storedProjectId !== projectId) return; 
    
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
  }, [setNodes, isProjectOwner]);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!isProjectOwner) return;
      setEdges((edges) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: {
          strokeWidth: 2,
          stroke: 'white',
        },
      } as Edge, edges));
    },
    [setEdges, isProjectOwner]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Set dragging state to true when dragging over canvas
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const onDragEnd = useCallback(() => {
    // Reset dragging state when drag operation ends
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!isProjectOwner || !reactFlowWrapper.current) return;

      event.preventDefault();
      // Reset dragging state
      setIsDragging(false);

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowBounds) {
        return;
      }

      // Check if drop is on trash icon
      const trashElement = document.getElementById('node-trash-area');
      if (trashElement) {
        const trashBounds = trashElement.getBoundingClientRect();
        if (
          event.clientX >= trashBounds.left &&
          event.clientX <= trashBounds.right &&
          event.clientY >= trashBounds.top &&
          event.clientY <= trashBounds.bottom
        ) {
          return;
        }
      }

      // Check if drop is on sidebar
      const sidebarElement = document.getElementById('node-sidebar-container');
      if (sidebarElement) {
        const sidebarBounds = sidebarElement.getBoundingClientRect();
        if (
          event.clientX >= sidebarBounds.left &&
          event.clientX <= sidebarBounds.right &&
          event.clientY >= sidebarBounds.top &&
          event.clientY <= sidebarBounds.bottom
        ) {
          return;
        }
      }

      // Calculate position in flow coordinates
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });

      // Add the new node at the drop position
      addNewNode(type, position);
    },
    [isProjectOwner, reactFlowInstance, addNewNode, setIsDragging]
  );

  const handleMenuToggle = useCallback((isOpen: boolean) => {
    setMenuOpen(isOpen);
  }, []);

  const handleProjectMenuToggle = useCallback((isOpen: boolean) => {
    setProjectMenuOpen(isOpen);
  }, []);

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
        onDragEnd={onDragEnd}
        selectionMode={selectionMode ? SelectionMode.Full : SelectionMode.Partial}
        selectionOnDrag={selectionMode}
        panOnDrag={!selectionMode}
        panOnScroll={true}
        proOptions={{
          hideAttribution: true
        }}
        fitView
      >
        {isLoading ? (
          <div className="flex flex-col min-h-screen min-w-screen items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p>Loading project...</p>
          </div>
        ) : (
          <Background />
        )}

        {isDragging && isProjectOwner && (
          <Panel position="bottom-center" className="p-[20px]" style={{ zIndex: 1000 }}>
            <div 
              id="node-trash-area"
              className="w-12 h-12 flex items-center justify-center bg-[#2D2D2D] rounded-full shadow-lg transition-all hover:scale-110"
            >
              <Icons.FiTrash2 className="text-white" size={24} />
            </div>
          </Panel>
        )}
        <Toolbar
          selectionMode={selectionMode}
          toggleSelectionMode={toggleSelectionMode}
          isReadOnly={!isProjectOwner}
          onExport={handleExport}
          onImport={handleImport}
          projectId={projectId}
          onProjectChange={handleProjectChange}
          projectData={projectData}
          onProjectMenuToggle={handleProjectMenuToggle}
        />
        <NodeSidebar
          nodeTypesData={nodeTypesData}
          addNewNode={addNewNode}
          isReadOnly={!isProjectOwner}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />
        <Menu
          onMenuToggle={handleMenuToggle}
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
          forceCollapse={menuOpen || projectMenuOpen}
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