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
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";
import LessonPanel from "@/components/lesson/LessonPanel";
import { useSearchParams } from "next/navigation";
import { nodeUtils } from "@/utils/nodeUtils";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useLesson } from "@/contexts/LessonContext";
import { courses } from "@/courses";

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
  const lessonInitializedRef = useRef<string | null>(null);
  const startingNodesLoadedRef = useRef<string | null>(null);

  // Hooks
  const reactFlowInstance = useReactFlow();
  const { supabaseUser } = useUserAccountContext();
  const searchParams = useSearchParams();
  const { canUndo, canRedo, undo, redo, saveState, clearHistory, isApplyingHistory } = useUndoRedo(setNodes, setEdges);
  const { startLesson, active: lessonActive, courseId, resetLesson, exitLesson, lessonIndex } = useLesson();
  const urlCourseId = searchParams?.get('courseId');
  const urlLessonId = searchParams?.get('lesson');
  const lessonMode = !!(urlCourseId && urlLessonId);
  
  const nodeTypesData = useMemo(() => createNodeTypes(setNodes), [setNodes]);

  const canEdit = lessonMode || isProjectOwner;

  // Handle project change notification from Menu component
  const handleProjectChange = useCallback(() => {
    projectLoadedRef.current = false; 
    setIsLoading(true);              
  }, []);

  // Load project from localStorage
  useEffect(() => {
    if (lessonMode) {
      // For Lessons, only start with blank canvas if no starting nodes have been loaded
      // Check if starting nodes are already loaded for the current lesson
      if (startingNodesLoadedRef.current === null) {
        setNodes([]);
        setEdges([]);
      }
      setIsLoading(false);
      return;
    }
    
    const loadProjectFromStorage = async () => {
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
            
            setTimeout(() => {
              saveState(projectData.nodes || [], projectData.edges || []);
            }, 100);
          } else {
            console.warn('User does not have access to this project');
            localStorage.removeItem('currentProjectId');
            setNodes([]);
            setEdges([]);
            clearHistory();
          }
        } else {
          // No project ID in localStorage, use empty canvas
          setNodes([]);
          setEdges([]);
          setProjectId(null);
          setIsProjectOwner(true);
          clearHistory();
        }
      } catch (error) {
        console.error('Error loading project:', error);
        localStorage.removeItem('currentProjectId');
        setNodes([]);
        setEdges([]);
        setProjectId(null);
        setIsProjectOwner(true);
      } finally {
        setIsLoading(false);
        projectLoadedRef.current = true;
      }
    };
    
    loadProjectFromStorage();
    
    return () => {
      projectLoadedRef.current = false;
    };
  }, [supabaseUser, setNodes, setEdges, isLoading, lessonMode]);

  // Start Lesson lesson when URL parameters are detected
  useEffect(() => {
    if (urlCourseId && urlLessonId) {
      const lessonKey = `${urlCourseId}-${urlLessonId}`;
      
      // Only start the lesson if we haven't already initialized this exact lesson
      if (lessonInitializedRef.current !== lessonKey) {
        console.log('Starting lesson from URL:', urlCourseId, urlLessonId);
        lessonInitializedRef.current = lessonKey;
        startLesson(urlCourseId, urlLessonId);
      }
    }
  }, [urlCourseId, urlLessonId, startLesson]);

  useEffect(() => {
    if (!lessonActive) {
      lessonInitializedRef.current = null;
    }
  }, [lessonActive]);

  useEffect(() => {
    if (!lessonMode) return;
    
    if (!lessonActive || !courseId || lessonIndex < 0) {
      console.log('Early return due to missing data:', { lessonActive, courseId, lessonIndex });
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const currentCourse = courses[courseId];
      if (!currentCourse) {
        console.log('No course found for courseId:', courseId);
        return;
      }
      
      const currentLesson = currentCourse.lessons[lessonIndex];
      if (!currentLesson) {
        console.log('No lesson found at index:', lessonIndex, 'in course:', currentCourse);
        return;
      }
            
      if (!currentLesson.startNodes || !currentLesson.startEdges) {
        console.log('Lesson missing startNodes or startEdges');
        return;
      }
      
      const lessonKey = `${courseId}-${currentLesson.id}`;
      
      // Only load starting nodes if we haven't loaded them for this specific lesson yet
      if (startingNodesLoadedRef.current !== lessonKey) {
        setNodes(currentLesson.startNodes);
        setEdges(currentLesson.startEdges);
        startingNodesLoadedRef.current = lessonKey;
        
        // Clear history and save new state for undo/redo
        clearHistory();
        setTimeout(() => {
          saveState(currentLesson.startNodes || [], currentLesson.startEdges || []);
        }, 100);
      } else {
        console.log('Starting nodes already loaded for this lesson');
      }
    }, 50); 
    
    return () => clearTimeout(timeoutId);
  }, [lessonMode, lessonActive, courseId, lessonIndex, setNodes, setEdges, clearHistory, saveState]);

  useEffect(() => {
    if (!lessonActive) {
      startingNodesLoadedRef.current = null;
    }
  }, [lessonActive]);

  // Save state to history when nodes or edges change
  useEffect(() => {
    if (lessonMode) return; 
    if (!projectLoadedRef.current || isLoading) return; 
    if (isNodeDragging) return; 
    if (isApplyingHistory()) return; 
    
    // Debounce state saving to avoid too many history entries during rapid changes
    const timeoutId = setTimeout(() => {
      if (!isApplyingHistory()) {
        saveState(nodes, edges);
      }
    }, 100); // Reduced debounce time
    
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, lessonMode, isLoading, isNodeDragging, saveState, isApplyingHistory]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!canEdit) return;
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, undo, redo]);

  // Auto-save changes to Supabase
  useEffect(() => {
    console.log('nodes', nodes);
    console.log('edges', edges);
    if (lessonMode) return; 
    
    if (!projectId || !supabaseUser || isLoading || !projectLoadedRef.current) return;
    if (isNodeDragging) return;
    
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
  }, [nodes, edges, projectId, supabaseUser, isLoading, isNodeDragging, lessonMode]);

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
    
    // Clear history and save new state
    clearHistory();
    setTimeout(() => {
      saveState(importedNodes, importedEdges);
    }, 100);
  }, [setNodes, setEdges, reactFlowInstance, clearHistory, saveState]);

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
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
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
              
              clearHistory();
              setTimeout(() => {
                saveState(restoredNodes, restoredEdges);
              }, 100);
            }}
            forceCollapse={menuOpen || projectMenuOpen}
          />
        </ReactFlow>
      </div>

      {lessonActive && (
        <div style={{ width: '30%', maxWidth: '420px', height: '100%' }}>
          <LessonPanel nodes={nodes} edges={edges} output={output} />
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