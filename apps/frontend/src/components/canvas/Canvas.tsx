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
  Panel,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "../../types/EdgeTypes";
import { 
  createNodeTypes, 
  nodeTypes 
} from "../../types/NodeTypes";
import { Toolbar } from "./Toolbar";
import { NodeSidebar } from "./NodeSidebar";
import { Console } from "../console/Console";
import { Menu } from "./Menu";
import { 
  saveCanvasChanges, 
  getProject 
} from "@/lib/projects";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { Icons } from "../icons/icons";
import { Project } from "@/types/ProjectTypes";
import { OutputValueTypeString } from "@/types/OutputTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";
import TutorialPanel from "@/tutorials/components/TutorialPanel";
import { useSearchParams } from "next/navigation";
import { nodeUtils } from "@/utils/nodeUtils";

// Internal component that uses ReactFlow hooks
function Flow() {
  // State variables
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [debug, setDebug] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isNodeDragging, setIsNodeDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [connectionDragging, setConnectionDragging] = useState<Connection | null>(null);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectLoadedRef = useRef(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Hooks
  const reactFlowInstance = useReactFlow();
  const { supabaseUser } = useUserAccountContext();
  const searchParams = useSearchParams();
  const tutorialUnitId = searchParams?.get('tutorial');
  const tutorialMode = !!tutorialUnitId;
  
  // Create node types with setNodes
  const nodeTypesData = useMemo(() => createNodeTypes(setNodes), [setNodes]);

  // Allow editing either if user owns the project OR we are in tutorial mode
  const canEdit = tutorialMode || isProjectOwner;

  // Handle project change notification from Menu component
  const handleProjectChange = useCallback(() => {
    projectLoadedRef.current = false; // Reset the project loaded state
    setIsLoading(true);               // Set loading state to trigger a reload
  }, []);

  // Load project from localStorage
  useEffect(() => {
    if (tutorialMode) {
      // For tutorials, start with blank canvas
      setNodes([]);
      setEdges([]);
      setIsLoading(false);
      return;
    }
    
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
          
          const projectData: Project | null = await getProject(storedProjectId);
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
  }, [supabaseUser, setNodes, setEdges, isLoading, tutorialMode]);

  // Auto-save changes to Supabase
  useEffect(() => {
    console.log('nodes', nodes);
    if (tutorialMode) return; // Don't autosave during tutorial
    
    if (!projectId || !supabaseUser || isLoading || !projectLoadedRef.current) return;
    if (isNodeDragging) return; // Don't save while dragging nodes
    
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (storedProjectId !== projectId) return; 
    
    // Get project data to verify ownership
    const checkProjectOwnership = async () => {
      try {
        const projectData: Project | null = await getProject(projectId);
        
        // Only save if user is the owner
        if (projectData?.user_id !== supabaseUser.id) {
          return;
        }
        
        // Debounce saves to prevent too many API calls
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        console.log('Saving canvas changes...');
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
  }, [nodes, edges, projectId, supabaseUser, isLoading, isNodeDragging, tutorialMode]);

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
    if (!canEdit) return; // Prevent edits if not allowed
    
    // If position is provided, use it; otherwise use viewport center
    let nodePosition = position;

    const newNode: FlowNode = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type: type,
      position: nodePosition || { x: 0, y: 0 },
      data: {
        inputs: nodeTypes[type].defaultInputs,
        output: nodeTypes[type].defaultOutput
      }
    };
  
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, canEdit]);

  // Function to check if a connection is valid based on handle types
  const isValidConnection = useCallback((connection: Connection): boolean => {
    return nodeUtils.validateConnection(connection, nodes);
  }, [nodes]);

  // Add connection start handler
  const onConnectStart = useCallback((_: any, { nodeId, handleId, handleType }: any) => {
    setConnectionDragging({
      source: handleType === 'source' ? nodeId : null,
      sourceHandle: handleType === 'source' ? handleId : null,
      target: handleType === 'target' ? nodeId : null,
      targetHandle: handleType === 'target' ? handleId : null,
    });
  }, []);
  
  // Add connection end handler
  const onConnectEnd = useCallback(() => {
    setConnectionDragging(null);
  }, []);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!canEdit) return;
      if (isValidConnection(connection)) {
        setEdges((edges) => addEdge({
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: {
            strokeWidth: 2,
            stroke: 'white',
          },
        } as FlowEdge, edges));
      }
    },
    [setEdges, canEdit, isValidConnection]
  );

  // Update handle styles when connection is being dragged
  useEffect(() => {
    if (!connectionDragging) return;
    
    // Add a CSS class to the root element to indicate a connection is being dragged
    document.documentElement.classList.add('connection-dragging');
    
    // Add style tag to highlight valid handles
    const styleElement = document.createElement('style');
    styleElement.id = 'valid-handles-style';
    
    // Add CSS for handle highlighting
    styleElement.innerHTML = `
      .connection-dragging .react-flow__handle {
        /* Default style for handles during dragging - more muted */
        background-color: #555 !important;
        border-color: #555 !important;
      }
      
      .connection-dragging .react-flow__handle.valid-connection {
        /* Style for permissible handles - green */
        background-color: #4CAF50 !important;
        border-color: #4CAF50 !important;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.7) !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Store validation results to avoid rechecking
    const validHandleMap = new Map();
    
    // Apply valid-connection class to permissible handles (run once)
    const handles = document.querySelectorAll('.react-flow__handle');
    handles.forEach(handle => {
      const handleElement = handle as HTMLElement;
      const nodeId = handleElement.closest('.react-flow__node')?.getAttribute('data-id');
      const handleId = handleElement.getAttribute('data-handleid');
      const handleType = handleElement.classList.contains('source') ? 'source' : 'target';
      
      // Skip the handle being dragged
      if ((connectionDragging.source === nodeId && connectionDragging.sourceHandle === handleId) ||
          (connectionDragging.target === nodeId && connectionDragging.targetHandle === handleId)) {
        return;
      }
      
      // Generate a unique key for this handle
      const handleKey = `${nodeId}-${handleId}-${handleType}`;
      
      // Check if we already validated this handle
      if (!validHandleMap.has(handleKey)) {
        // Check if this connection would be valid
        const testConnection = {
          source: handleType === 'target' ? connectionDragging.source : nodeId,
          sourceHandle: handleType === 'target' ? connectionDragging.sourceHandle : handleId,
          target: handleType === 'target' ? nodeId : connectionDragging.target,
          targetHandle: handleType === 'target' ? handleId : connectionDragging.targetHandle,
        };
        
        // If the source is dragging, check handles that could be targets
        // If the target is dragging, check handles that could be sources
        if ((connectionDragging.source && handleType === 'target') || 
            (connectionDragging.target && handleType === 'source')) {
          const isValid = isValidConnection(testConnection as Connection);
          validHandleMap.set(handleKey, isValid);
          
          if (isValid) {
            handleElement.classList.add('valid-connection');
          }
        }
      }
    });
    
    return () => {
      // Clean up
      document.documentElement.classList.remove('connection-dragging');
      const styleElement = document.getElementById('valid-handles-style');
      if (styleElement) {
        styleElement.remove();
      }
      
      // Remove any added classes
      const handles = document.querySelectorAll('.react-flow__handle');
      handles.forEach(handle => {
        handle.classList.remove('valid-connection');
      });
    };
  }, [connectionDragging, isValidConnection]);

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
      if (!canEdit || !reactFlowWrapper.current) return;

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
    [canEdit, reactFlowInstance, addNewNode, setIsDragging]
  );

  const handleMenuToggle = useCallback((isOpen: boolean) => {
    setMenuOpen(isOpen);
  }, []);

  const handleProjectMenuToggle = useCallback((isOpen: boolean) => {
    setProjectMenuOpen(isOpen);
  }, []);

  const handleNodesChange = useCallback((changes: any[]) => {
    const isDragStart = changes.some((change: any) => change.type === 'position' && change.dragging === true);
    const isDragEnd = changes.some((change: any) => change.type === 'position' && change.dragging === false);
    
    if (isDragStart) {
      setIsNodeDragging(true);
    } else if (isDragEnd) {
      setIsNodeDragging(false);
    }
    
    onNodesChange(changes);
  }, [onNodesChange]);

  return (
    <div className="w-full h-screen flex">
      {/* Left section: Canvas */}
      <div className="flex-grow h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypesData}
          edgeTypes={edgeTypes}
          onNodesChange={canEdit ? handleNodesChange : undefined}
          onEdgesChange={canEdit ? onEdgesChange : undefined}
          onConnect={canEdit ? onConnect : undefined}
          onConnectStart={canEdit ? onConnectStart : undefined}
          onConnectEnd={canEdit ? onConnectEnd : undefined}
          onDrop={canEdit ? onDrop : undefined}
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
          isValidConnection={(params) => isValidConnection(params as Connection)}
        >
          {isLoading ? (
            <div className="flex flex-col min-h-screen min-w-screen items-center justify-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p>Loading project...</p>
            </div>
          ) : (
            <Background />
          )}

          {isDragging && canEdit && (
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
            isReadOnly={!canEdit}
            onExport={handleExport}
            onImport={handleImport}
            projectId={projectId}
            onProjectChange={handleProjectChange}
            projectData={projectData}
            onProjectMenuToggle={handleProjectMenuToggle}
          />
          <NodeSidebar
            nodeTypes={nodeTypes}
            addNewNode={addNewNode}
            isReadOnly={!canEdit}
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

      {/* Right section: Tutorial Panel (30% width) */}
      {tutorialMode && tutorialUnitId && (
        <div style={{ width: '30%', maxWidth: '420px', height: '100%' }}>
          <TutorialPanel unitId={tutorialUnitId} nodes={nodes} edges={edges} />
        </div>
      )}
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