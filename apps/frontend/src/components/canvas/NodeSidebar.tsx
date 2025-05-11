import { useState, useRef, useEffect } from "react";
import { Panel } from "@xyflow/react";
import { NodeCategory, NodeType } from "../../types/NodeTypes";
import { Icons } from "../icons/icons";

interface NodeSidebarProps {
  nodeTypes: Record<string, NodeType>;
  addNewNode: (type: any, position?: { x: number; y: number }) => void;
  isReadOnly?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const NodeSidebar = ({
  nodeTypes,
  addNewNode,
  isReadOnly = false,
  onDragStart,
  onDragEnd,
}: NodeSidebarProps) => {
  const [activeTab, setActiveTab] = useState<NodeCategory>("Code");
  const [isOpen, setIsOpen] = useState(true);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nodeListRef = useRef<HTMLDivElement | null>(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const categories: NodeCategory[] = ['Code', 'Database', 'Blockchain', 'DeFi', 'Provider', 'Misc'];
  
  // Group nodes by category
  const nodesByCategory = categories.reduce((acc, category) => {
    acc[category] = Object.values(nodeTypes).filter(
      (type) => type.metadata.category === category
    );
    return acc;
  }, {} as Record<NodeCategory, NodeType[]>);

  // Set category refs
  const setCategoryRef = (element: HTMLDivElement | null, category: string) => {
    if (element) {
      categoryRefs.current[category] = element;
    }
  };

  // Scroll to category when tab changes
  useEffect(() => {
    if (categoryRefs.current[activeTab] && nodeListRef.current) {
      categoryRefs.current[activeTab]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [activeTab]);

  const onDragStartHandler = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    if (isReadOnly) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    
    // Notify parent component that dragging has started
    if (onDragStart) {
      onDragStart();
    }
  };

  const onDragEndHandler = () => {
    // Notify parent component that dragging has ended
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const onDragOverHandler = (event: React.DragEvent<HTMLDivElement>) => {
    // Prevent default to allow drop and set dropEffect
    event.preventDefault();
    event.dataTransfer.dropEffect = 'none';
  };

  const onDropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    // Prevent default and stop propagation to cancel the drop
    event.preventDefault();
    event.stopPropagation();
    
    // Reset drag state
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <Panel position="top-left" className="ml-2 pt-[10px]">
      <div 
        id="node-sidebar-container" 
        className="flex h-[calc(100vh-60px)]"
        onDragOver={onDragOverHandler}
        onDrop={onDropHandler}
      >
        {/* Collapsed state - just show expand button */}
        {!isOpen && (
          <button
            onClick={toggleSidebar}
            className="bg-[#1E1E1E] text-white hover:bg-[#2D2D2D] p-2 rounded-lg shadow-lg"
            title="Expand Nodes Panel"
          >
            <Icons.FiArrowRight size={16} />
          </button>
        )}

        {/* Expanded state - show full sidebar */}
        {isOpen && (
          <div className="flex flex-col bg-[#1E1E1E] rounded-lg shadow-lg h-full">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
              <h3 className="text-white font-medium">Nodes</h3>
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white"
                title="Collapse Nodes Panel"
              >
                <Icons.FiX size={16} />
              </button>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-row flex-1 min-h-0">
              {/* Categories Column - Independently scrollable */}
              <div className="w-20 border-r border-gray-700 overflow-y-auto flex-shrink-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`w-full px-2 py-3 text-xs text-center transition-colors ${
                      activeTab === category
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-gray-800"
                    } flex flex-col items-center`}
                  >
                    <span className="block mb-1">{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                  </button>
                ))}
              </div>

              {/* Node Items - All categories in one scrollable list */}
              <div className="flex-1 flex flex-col w-28">
                {/* Node List */}
                <div 
                  ref={nodeListRef}
                  className="overflow-y-auto flex-1"
                >
                  {categories.map((category) => (
                    <div 
                      key={category} 
                      ref={(el) => setCategoryRef(el, category)}
                    >
                      {/* Category Header */}
                      <div className="sticky top-0 bg-[#1E1E1E] p-2 z-20 font-medium text-xs text-gray-300 flex items-center border-b border-t border-gray-700">
                        <span className="mr-2">{getCategoryIcon(category)}</span>
                        <span>{category}</span>
                      </div>
                      
                      {/* Category Nodes */}
                      <div className="grid grid-cols-1 gap-2 p-1">
                        {nodesByCategory[category].length === 0 && (
                          <div className="flex flex-col items-center text-center py-10 text-gray-400 text-xs">
                            <Icons.FiInfo className="mb-2" size={18} />
                            <span>Nodes coming soon...</span>
                          </div>
                        )}
                        {nodesByCategory[category].map((type) => (
                          <div
                            key={type.metadata.id}
                            className={`flex flex-col items-center p-2 rounded transition-colors ${
                              isReadOnly
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-700 cursor-grab"
                            }`}
                            onClick={isReadOnly ? undefined : () => addNewNode(type.metadata.id)}
                            draggable={!isReadOnly}
                            onDragStart={
                              isReadOnly 
                                ? undefined 
                                : (event) => onDragStartHandler(event, type.metadata.id)
                            }
                            onDragEnd={isReadOnly ? undefined : onDragEndHandler}
                          >
                            <div
                              className={`w-full h-[40px] flex items-center justify-center ${type.metadata.backgroundColor} rounded border ${type.metadata.borderColor}`}
                            >
                              <span
                                className={`text-xs ${type.metadata.textColor} font-medium`}
                              >
                                {type.metadata.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Read-Only Notice (if applicable) */}
                {isReadOnly && (
                  <div className="flex items-center justify-center bg-amber-700/20 text-amber-400 px-2 py-2 mx-2 mb-2 rounded-md text-xs">
                    View Only - Cannot Add Nodes
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

// Helper function to get appropriate icons for categories
function getCategoryIcon(category: NodeCategory) {
  switch (category) {
    case "Code":
      return <Icons.FiBox size={14} />;
    case "Database":
      return <Icons.FiDatabase size={14} />;
    case "Blockchain":
      return <Icons.FiShare2 size={14} />;
    case "DeFi":
      return <Icons.PiMoneyWavyLight size={18} />;
    case "Provider":
      return <Icons.FiCommand size={14} />;
    case "Misc":
      return <Icons.FiMoreHorizontal size={14} />;
    default:
      return <Icons.FiBox size={14} />;
  }
} 